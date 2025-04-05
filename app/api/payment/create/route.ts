import { NextResponse } from "next/server"
import { connectToDatabase, validateRegistrationId, hasUserPaid } from "@/lib/mongodb"
import { createPaymentOrder, generateOrderId } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const { registrationId } = await request.json()

    // Validate the registration ID
    if (!validateRegistrationId(registrationId.trim())) {
      return NextResponse.json(
        {
          error: "Invalid registration ID. The 7th and 8th digits must be 4 and 9.",
        },
        { status: 400 },
      )
    }

    // Check if the user has already paid
    const alreadyPaid = await hasUserPaid(registrationId.trim())
    if (alreadyPaid) {
      return NextResponse.json(
        {
          error: "You have already paid for this registration ID.",
          alreadyPaid: true,
        },
        { status: 400 },
      )
    }

    // Generate a unique order ID
    const orderId = generateOrderId(registrationId.trim())

    // Create the payment order
    const orderData = {
      order_id: orderId,
      order_amount: 20, // 20 rs participation fee
      order_currency: "INR",
      order_note: "QR Scavenger Hunt Participation Fee",
      customer_details: {
        customer_id: registrationId.trim(),
        customer_name: registrationId.trim(),
        customer_phone: "9999999999", // Placeholder
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-qr-code-project-setup.vercel.app"}/payment/callback?order_id={order_id}&registration_id=${registrationId.trim()}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-qr-code-project-setup.vercel.app"}/api/payment/webhook`,
      },
    }

    const paymentResponse = await createPaymentOrder(orderData)

    // Store the initial payment record
    const { db } = await connectToDatabase()
    await db.collection("payments").insertOne({
      registrationId: registrationId.trim(),
      orderId: orderId,
      amount: 20,
      status: "CREATED",
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      paymentLink: paymentResponse.payments?.url,
      orderId: orderId,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}

