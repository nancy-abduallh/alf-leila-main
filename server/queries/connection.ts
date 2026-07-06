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

  // mysql2 doesn't understand the `ssl-mode=REQUIRED` query parameter that
  // Aiven's example connection string uses (that syntax comes from
  // MySQL Connector/J / the mysql CLI, not the mysql2 npm package), so it
  // never enables TLS on its own just from the raw string. We translate
  // that intent into a real `ssl` option ourselves here.
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
  const url = new URL(env.databaseUrl);
  return mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: resolveSsl(url),
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