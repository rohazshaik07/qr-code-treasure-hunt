import { NextResponse } from "next/server"
import { connectToDatabase, normalizeRegistrationId, verifyUserFromPayment } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { registrationId, name, email, phone } = await request.json()

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    console.log(`Admin manually verifying user: ${normalizedId}`)

    // Verify the user
    const success = await verifyUserFromPayment(normalizedId, name || "", email || "", phone || "")

    if (!success) {
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }

    // Create a payment record if it doesn't exist
    const { db } = await connectToDatabase()
    const existingPayment = await db.collection("payments").findOne({
      registrationId: normalizedId,
    })

    if (!existingPayment) {
      const manualOrderId = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      await db.collection("payments").insertOne({
        orderId: manualOrderId,
        registrationId: normalizedId,
        name: name || "Manual Verification",
        email: email || "",
        phone: phone || "",
        amount: 20, // Default amount
        timestamp: new Date(),
        status: "PAID",
        source: "manual_verification",
        createdAt: new Date(),
        processedAt: new Date(),
      })

      console.log(`Created manual payment record for ${normalizedId}`)
    }

    return NextResponse.json({
      success: true,
      message: `User ${normalizedId} has been verified successfully`,
    })
  } catch (error) {
    console.error("Error manually verifying user:", error)
    return NextResponse.json(
      {
        error: "Failed to manually verify user",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

