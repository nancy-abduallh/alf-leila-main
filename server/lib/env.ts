import { config } from "dotenv";
config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

function optional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  databaseUrl: required("DATABASE_URL"),
  databaseCaCert: optional("DATABASE_CA_CERT"),
  port: parseInt(optional("PORT", "3000")!),

  jwtSecret: required("JWT_SECRET"),
  ownerEmail: optional("OWNER_EMAIL"),


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