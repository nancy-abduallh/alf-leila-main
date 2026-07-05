// api/lib/paymob.ts
import { createHmac } from "crypto";
import { env } from "./env";

const BASE_URL = "https://accept.paymob.com/api";

export type PaymobBillingData = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
};



async function getAuthToken(): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: env.paymobApiKey }),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Paymob authentication failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as { token: string };
    return data.token;
}

async function createPaymobOrder(
    authToken: string,
    amountCents: number,
    merchantOrderId: string,
): Promise<number> {
    const res = await fetch(`${BASE_URL}/ecommerce/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            auth_token: authToken,
            delivery_needed: false,
            amount_cents: amountCents,
            currency: "EGP",
            merchant_order_id: merchantOrderId,
            items: [],
        }),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Paymob order creation failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as { id: number };
    return data.id;
}

async function getPaymentKey(
    authToken: string,
    amountCents: number,
    paymobOrderId: number,
    billingData: PaymobBillingData,
): Promise<string> {
    const integrationId = Number(env.paymobIntegrationId);
    if (Number.isNaN(integrationId)) {
        throw new Error(
            `Invalid PAYMOB_INTEGRATION_ID: "${env.paymobIntegrationId}" is not a number`,
        );
    }

    const res = await fetch(`${BASE_URL}/acceptance/payment_keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: {
                first_name: billingData.first_name,
                last_name: billingData.last_name,
                email: billingData.email,
                phone_number: billingData.phone_number,
                apartment: "NA",
                floor: "NA",
                street: "NA",
                building: "NA",
                shipping_method: "NA",
                postal_code: "NA",
                city: "Cairo",
                country: "EG",
                state: "NA",
            },
            currency: "EGP",
            // Paymob requires this as a number, not a string.
            integration_id: integrationId,
        }),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Paymob payment key request failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as { token: string };
    return data.token;
}

export async function initiatePaymobPayment(params: {
    amountCents: number;
    merchantOrderId: string;
    billingData: PaymobBillingData;
}): Promise<{ paymobOrderId: number; iframeUrl: string }> {
    const authToken = await getAuthToken();
    const paymobOrderId = await createPaymobOrder(
        authToken,
        params.amountCents,
        params.merchantOrderId,
    );
    const paymentKey = await getPaymentKey(
        authToken,
        params.amountCents,
        paymobOrderId,
        params.billingData,
    );
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${env.paymobIframeId}?payment_token=${paymentKey}`;
    return { paymobOrderId, iframeUrl };
}

// Field order per Paymob's "transaction processed callback" HMAC spec.
// Verify against Paymob's current docs if signature checks start failing —
// they occasionally revise this list.
const HMAC_FIELD_ORDER = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auction",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
] as const;

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path
        .split(".")
        .reduce<unknown>(
            (acc, key) =>
                acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
            obj,
        );
}

export function verifyPaymobHmac(
    transaction: Record<string, unknown>,
    receivedHmac: string,
): boolean {
    const concatenated = HMAC_FIELD_ORDER.map((field) => {
        const value = getNestedValue(transaction, field);
        return value === null || value === undefined ? "" : String(value);
    }).join("");

    const computed = createHmac("sha512", env.paymobHmacSecret)
        .update(concatenated)
        .digest("hex");

    return computed === receivedHmac;
}