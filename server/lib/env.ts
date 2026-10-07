import { config } from "dotenv";
config();

function required(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Environment variable ${key} is required but is missing/empty. ` +
      `Set it in Vercel → Project Settings → Environment Variables ` +
      `(for both Production and Preview), then trigger a NEW ` +
      `deployment — editing an env var does not update deployments ` +
      `that already exist.`,
    );
  }
  return value;
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || process.env.MYSQL_URL?.trim();
  if (url) return url;

  if (process.env.MYSQLHOST && process.env.MYSQLUSER) {
    const user = encodeURIComponent(process.env.MYSQLUSER);
    const pass = process.env.MYSQLPASSWORD ? encodeURIComponent(process.env.MYSQLPASSWORD) : "";
    const host = process.env.MYSQLHOST;
    const port = process.env.MYSQLPORT || "3306";
    const db = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "railway";
    return `mysql://${user}:${pass}@${host}:${port}/${db}`;
  }

  throw new Error(
    "Environment variable DATABASE_URL (or MYSQL_URL) is required but is missing/empty. " +
    "Set it in Railway → alf-leila-main → Variables tab, then redeploy."
  );
}

function optional(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || defaultValue;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  databaseUrl: getDatabaseUrl(),
  databaseCaCert: optional("DATABASE_CA_CERT"),
  port: parseInt(optional("PORT", "3000")!),

  jwtSecret: optional("JWT_SECRET", "ebf5f19f90865e627e62b4e04077057b107f89a8dac479adc81060d25dfe0777")!,
  ownerEmail: optional("OWNER_EMAIL", "admin@gmail.com"),

  paymobApiKey: optional("PAYMOB_API_KEY"),
  paymobIntegrationId: optional("PAYMOB_INTEGRATION_ID"),
  paymobIframeId: optional("PAYMOB_IFRAME_ID"),
  paymobHmacSecret: optional("PAYMOB_HMAC_SECRET"),
};

export function getPaymobConfig() {
  const missing: string[] = [];
  if (!env.paymobApiKey) missing.push("PAYMOB_API_KEY");
  if (!env.paymobIntegrationId) missing.push("PAYMOB_INTEGRATION_ID");
  if (!env.paymobIframeId) missing.push("PAYMOB_IFRAME_ID");
  if (!env.paymobHmacSecret) missing.push("PAYMOB_HMAC_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Paymob is not configured. Missing environment variable(s): ${missing.join(", ")}`,
    );
  }

  return {
    apiKey: env.paymobApiKey!,
    integrationId: env.paymobIntegrationId!,
    iframeId: env.paymobIframeId!,
    hmacSecret: env.paymobHmacSecret!,
  };
}