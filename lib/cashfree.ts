// Cashfree Payment Integration Utilities
import crypto from "crypto";

// Types for Cashfree API
export interface CashfreePaymentOrder {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_note?: string;
  customer_details: {
    customer_id: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
  order_meta?: {
    return_url: string;
    notify_url?: string;
    payment_methods?: string;
  };
}

export interface CashfreePaymentResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_note?: string;
  order_expiry_time?: string;
  payments?: {
    url: string;
  };
  refunds?: any;
  settlements?: any;
}

export interface CashfreeWebhookPayload {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags?: any;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string;
      bank_reference: string;
      auth_id?: string;
      payment_method: {
        payment_method_type?: string;
        payment_method_details?: {
          bank_name?: string;
          upi_id?: string;
          card_number?: string;
          card_network?: string;
          card_type?: string;
          card_bank_name?: string;
        };
      };
    };
    customer_details?: {
      customer_id: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
    };
  };
  event_time: string;
  type: string;
}

// Environment variables with type safety
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Validate environment variables
if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
  throw new Error("Missing Cashfree credentials in environment variables");
}

// API URLs
export const CASHFREE_API_URL = IS_PRODUCTION
  ? "https://api.cashfree.com/pg/orders"
  : "https://sandbox.cashfree.com/pg/orders";

// Create a payment order
export async function createPaymentOrder(
  orderData: CashfreePaymentOrder
): Promise<CashfreePaymentResponse> {
  try {
    const response = await fetch(CASHFREE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cashfree API error: ${errorData.message || JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment order:", error);
    throw error;
  }
}

// Verify payment signature using HMAC SHA256
export function verifyWebhookSignature(
  webhookBody: string,
  signature: string,
  clientSecret: string = CASHFREE_SECRET_KEY
): boolean {
  try {
    const computedSignature = crypto
      .createHmac("sha256", clientSecret)
      .update(webhookBody)
      .digest("base64");
    return computedSignature === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// Generate a unique order ID
export function generateOrderId(registrationId: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `HUNT-${registrationId}-${timestamp}-${randomStr}`;
}