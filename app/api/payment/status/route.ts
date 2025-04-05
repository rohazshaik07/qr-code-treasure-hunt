import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("order_id")
    const registrationId = searchParams.get("registration_id")

    if (!orderId && !registrationId) {
      return NextResponse.json({ error: "Order ID or Registration ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let paymentRecord
    if (orderId) {
      paymentRecord = await db.collection("payments").findOne({ orderId })
    } else if (registrationId) {
      // Find the latest payment for this registration ID
      paymentRecord = await db
        .collection("payments")
        .find({ registrationId })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray()
        .then((records) => records[0] || null)
    }

    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        orderId: paymentRecord.orderId,
        registrationId: paymentRecord.registrationId,
        status: paymentRecord.status,
        amount: paymentRecord.amount,
        paymentId: paymentRecord.paymentId,
        bankingName: paymentRecord.bankingName,
        timestamp: paymentRecord.timestamp,
        updatedAt: paymentRecord.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}

