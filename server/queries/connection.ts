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
      // No CA certificate supplied via DATABASE_CA_CERT. The connection
      // is still encrypted, we just can't verify the server's cert chain
      // without the provider's CA bundle.
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

  // Deliberately no password in this log line — safe to see in Vercel's
  // Function logs. Use this to confirm the deployed function is actually
  // pointed at the host/db you expect.
  console.log(
    `[db] connecting to mysql://${decodeURIComponent(url.username)}@${url.hostname}:${url.port || 3306}/${url.pathname.replace(/^\//, "")} (ssl: ${ssl ? "on" : "off"})`,
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
    // with no useful message). If this ever fires, the error will say
    // "connect ETIMEDOUT" — check the provider's IP allowlist/firewall.
    connectTimeout: 8000,
    // Serverless functions can spin up many concurrent pool instances
    // (one per cold-started container). Keep each pool's footprint small
    // so we don't exhaust the database's max connection count under load.
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