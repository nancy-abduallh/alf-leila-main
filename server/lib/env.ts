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
  port: parseInt(optional("PORT", "3000")!),

  jwtSecret: required("JWT_SECRET"),
  ownerEmail: optional("OWNER_EMAIL"),

  paymobApiKey: required("PAYMOB_API_KEY"),
  paymobIntegrationId: required("PAYMOB_INTEGRATION_ID"),
  paymobIframeId: required("PAYMOB_IFRAME_ID"),
  paymobHmacSecret: required("PAYMOB_HMAC_SECRET"),
};