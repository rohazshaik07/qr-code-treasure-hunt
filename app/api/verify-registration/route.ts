import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyRegistration, testConnection } from "@/lib/verification-service"
import { connectToDatabase, verifyUserFromPayment } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { registrationId } = await request.json()

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration ID is required",
        },
        { status: 400 },
      )
    }

    console.log(`Verifying registration ID: ${registrationId}`)

    // Verify against Google Sheets
    const verificationResult = await verifyRegistration(registrationId)

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification service error",
          error: verificationResult.message,
        },
        { status: 500 },
      )
    }

    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          success: true,
          verified: false,
          message: verificationResult.message,
        },
        { status: 200 },
      )
    }

    // If verified, also update our database
    if (verificationResult.userData) {
      const { db } = await connectToDatabase()

      // Create a unique order ID for this verification
      const sheetOrderId = `SHEET-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      // Check if this user is already in our verified users collection
      const existingUser = await db.collection("verifiedUsers").findOne({
        registrationId: verificationResult.userData.registrationId,
      })

      if (!existingUser) {
        // Add to verified users collection
        await verifyUserFromPayment(
          verificationResult.userData.registrationId,
          verificationResult.userData.name || "",
          verificationResult.userData.email || "",
          "",
        )

        // Add to payments collection if not exists
        const existingPayment = await db.collection("payments").findOne({
          registrationId: verificationResult.userData.registrationId,
        })

        if (!existingPayment) {
          await db.collection("payments").insertOne({
            orderId: sheetOrderId,
            registrationId: verificationResult.userData.registrationId,
            name: verificationResult.userData.name || "Sheet Verification",
            email: verificationResult.userData.email || "",
            phone: "",
            amount: 20, // Default amount
            timestamp: new Date(),
            status: "PAID",
            source: "google_sheets_verification",
            transactionId: verificationResult.userData.transactionId || "",
            createdAt: new Date(),
            processedAt: new Date(),
          })
        }
      }

      // Set cookie with registration ID
      cookies().set("registration_id", verificationResult.userData.registrationId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Registration verified successfully",
      userData: verificationResult.userData,
    })
  } catch (error: any) {
    console.error("Error in verification API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during verification",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get("registrationId")
    const test = searchParams.get("test") === "true"

    // If test parameter is provided, test the connection
    if (test) {
      const testResult = await testConnection()
      return NextResponse.json(testResult)
    }

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration ID is required",
        },
        { status: 400 },
      )
    }

    // Verify against Google Sheets
    const verificationResult = await verifyRegistration(registrationId)

    return NextResponse.json({
      success: verificationResult.success,
      verified: verificationResult.verified,
      message: verificationResult.message,
      userData: verificationResult.verified ? verificationResult.userData : undefined,
    })
  } catch (error: any) {
    console.error("Error in verification API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during verification",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

