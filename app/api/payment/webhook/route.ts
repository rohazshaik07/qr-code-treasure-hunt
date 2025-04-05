import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyWebhookSignature, type CashfreeWebhookPayload } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    // Get the signature from headers
    const signature = request.headers.get("x-webhook-signature") || ""

    // Get the request body as text
    const bodyText = await request.text()

    // Verify the signature
    const isValid = verifyWebhookSignature(bodyText, signature)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Parse the body
    const webhookData = JSON.parse(bodyText) as CashfreeWebhookPayload

    // Extract payment details
    const { order, payment } = webhookData.data
    const orderId = order.order_id
    const paymentId = payment.cf_payment_id
    const paymentStatus = payment.payment_status
    const amount = payment.payment_amount

    // Extract banking details if available
    const paymentMethod = payment.payment_method?.payment_method_type || ""
    const bankingName =
      payment.payment_method?.payment_method_details?.bank_name ||
      payment.payment_method?.payment_method_details?.upi_id ||
      payment.payment_method?.payment_method_details?.card_bank_name ||
      ""

    // Get the registration ID from the order
    const { db } = await connectToDatabase()
    const paymentRecord = await db.collection("payments").findOne({ orderId })

    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    const registrationId = paymentRecord.registrationId

    // Update the payment status
    await db.collection("payments").updateOne(
      { orderId },
      {
        $set: {
          paymentId,
          status: paymentStatus === "SUCCESS" ? "PAID" : paymentStatus,
          bankingName,
          paymentMethod,
          paymentDetails: payment,
          updatedAt: new Date(),
        },
      },
    )

    // If payment is successful, create or update the user
    if (paymentStatus === "SUCCESS") {
      // Check if user exists
      const existingUser = await db.collection("users").findOne({ registrationId })

      if (existingUser) {
        // Update user with payment status
        await db.collection("users").updateOne(
          { registrationId },
          {
            $set: {
              hasPaid: true,
              paymentId,
              paymentTimestamp: new Date(),
            },
          },
        )
      } else {
        // Create new user
        await db.collection("users").insertOne({
          registrationId,
          createdAt: new Date(),
          hasPaid: true,
          paymentId,
          paymentTimestamp: new Date(),
          scannedComponents: [],
          progress: 0,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

