import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const encoder = new TextEncoder();
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;

    const hashBuffer = Buffer.from(hash, "hex");
    const derived = scryptSync(password, salt, KEY_LENGTH);

    if (derived.length !== hashBuffer.length) return false;
    return timingSafeEqual(derived, hashBuffer);
}

export async function signSessionToken(userId: number): Promise<string> {
    const secret = encoder.encode(env.jwtSecret);
    return new SignJWT({ sub: String(userId) })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secret);
}

export async function verifySessionToken(token: string): Promise<number | null> {
    try {
        const secret = encoder.encode(env.jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        if (!payload.sub) return null;
        const userId = parseInt(payload.sub, 10);
        return Number.isNaN(userId) ? null : userId;
    } catch {
        return null;
    }
}