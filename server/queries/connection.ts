// server/queries/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

import type { MySql2Database } from "drizzle-orm/mysql2";

let instance: MySql2Database<typeof fullSchema>;

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
    // Fail fast instead of hanging until the serverless function's max
    // duration is hit (which shows up as an opaque 504 GATEWAY_TIMEOUT
    // with no useful message). If this fires, the error will say
    // "connect ETIMEDOUT" or similar — almost always means Aiven's
    // "Allowed IP Addresses" list is blocking Vercel's outbound IP.
    connectTimeout: 8000,
    connectionLimit: 3,
    maxIdle: 3,
    idleTimeout: 30000,
  });
}

export function getDb() {
  if (!instance) {
    instance = drizzle(buildPool(), {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}

/**
 * Runs a promise with a hard timeout so a hung network call surfaces a
 * readable error instead of running out the clock on the whole
 * serverless function (which just shows up as a bare 504 in Vercel).
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
            `outbound connections — set it to 0.0.0.0/0 (or add Vercel's ` +
            `IP ranges) in the Aiven console.`,
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