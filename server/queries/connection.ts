// server/queries/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

import type { MySql2Database } from "drizzle-orm/mysql2";

let instance: MySql2Database<typeof fullSchema> | undefined;
let pool: mysql.Pool | undefined;

function resolveSsl(url: URL) {
  const sslMode = (
    url.searchParams.get("ssl-mode") ??
    url.searchParams.get("sslmode") ??
    ""
  ).toUpperCase();
  const sslFlag = url.searchParams.get("ssl");

  const wantsSsl =
    ["REQUIRED", "VERIFY_CA", "VERIFY_IDENTITY"].includes(sslMode) ||
    sslFlag === "true";

  if (!wantsSsl) return undefined;

  return env.databaseCaCert
    ? {
      ca: env.databaseCaCert,
      minVersion: "TLSv1.2" as const,
      rejectUnauthorized: true,
    }
    : {
      minVersion: "TLSv1.2" as const,
      // No DATABASE_CA_CERT set — connection is still encrypted, but we
      // can't verify Aiven's cert chain. Set DATABASE_CA_CERT (contents
      // of ca.pem) in Vercel env vars to switch to full verification.
      rejectUnauthorized: false,
    };
}

function buildPool() {
  let url: URL;
  try {
    url = new URL(env.databaseUrl);
  } catch {
    const masked = env.databaseUrl.replace(/:[^:@]*@/, ":****@");
    throw new Error(
      `DATABASE_URL could not be parsed as a valid URL (got: "${masked}"). ` +
      `Make sure it starts with "mysql://" and that special characters ` +
      `in the username/password (@ : / ? # % +) are percent-encoded.`,
    );
  }

  if (url.protocol !== "mysql:") {
    throw new Error(
      `DATABASE_URL must start with "mysql://" (got protocol "${url.protocol}").`,
    );
  }

  if (!url.password || url.password === "YOUR_REAL_PASSWORD") {
    throw new Error(
      `DATABASE_URL still has a placeholder password ("${url.password || "<empty>"}"). ` +
      `Copy the real password from Aiven → your service → Overview → ` +
      `Connection information → "Click to reveal password", percent-encode ` +
      `any special characters, update DATABASE_URL in Vercel, then redeploy.`,
    );
  }

  const ssl = resolveSsl(url);

  console.log(
    `[db] connecting to mysql://${decodeURIComponent(url.username)}@${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, "")} (ssl: ${ssl ? "on" : "off"}, caCert: ${env.databaseCaCert ? "provided" : "missing"})`,
  );

  return mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl,
    // Fail well inside Vercel Hobby's 10s function limit instead of
    // hanging until the platform kills the invocation with an opaque
    // 504 GATEWAY_TIMEOUT / FUNCTION_INVOCATION_TIMEOUT. If this fires,
    // the error will say "connect ETIMEDOUT" — almost always means
    // Aiven's "Allowed IP Addresses" list is blocking Vercel's outbound
    // traffic, or the DATABASE_URL host/port is wrong.
    connectTimeout: 4000,
    connectionLimit: 3,
    maxIdle: 3,
    idleTimeout: 30000,
  });
}

export function getDb() {
  if (!instance) {
    pool = buildPool();
    instance = drizzle(pool, {
      mode: "default",
      schema: fullSchema,
    });
  }
  return instance;
}

/**
 * Drops the cached pool so the next getDb() call builds a fresh one
 * instead of reusing a pool whose connections may be stuck. Call this
 * after a connection failure so a warm serverless instance doesn't keep
 * hammering the same broken pool on every subsequent request.
 */
export async function resetDb() {
  try {
    await pool?.end();
  } catch {
    // discarding it anyway
  }
  pool = undefined;
  instance = undefined;
}

/**
 * Runs a promise with a hard timeout so a hung network call surfaces a
 * readable error instead of running out the clock on the whole
 * serverless function (which just shows up as a bare 504 in Vercel).
 * Kept short — Vercel Hobby caps functions at 10s total, so every
 * timeout in this file needs to leave headroom for that.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `${label} timed out after ${ms}ms. This almost always means ` +
            `Aiven's "Allowed IP Addresses" list is blocking Vercel's ` +
            `outbound connections — set it to 0.0.0.0/0 and click ` +
            `"Save changes" in the Aiven console under your service → ` +
            `Overview → "Allowed IP Addresses".`,
          ),
        ),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}