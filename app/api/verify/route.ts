import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

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

    // Check if verification is enabled
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })
    const verificationEnabled = settings ? settings.verificationEnabled : true

    // If verification is disabled, automatically approve
    if (!verificationEnabled) {
      // Set cookie with registration ID
      cookies().set("registration_id", registrationId.trim().toUpperCase(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      })

      // Get the first clue for the user
      const firstClue = await db.collection("qrcodes").findOne({ componentId: "led" })

      return NextResponse.json({
        success: true,
        verified: true,
        message: "Verification bypassed - system in open access mode",
        registrationId: registrationId.trim().toUpperCase(),
        firstClue: firstClue
          ? {
              id: firstClue.id,
              componentId: firstClue.componentId,
              clue: firstClue.clue,
              hint: firstClue.hint,
              difficulty: firstClue.difficulty,
            }
          : null,
      })
    }

    // Normalize the registration ID
    const normalizedId = registrationId.trim().toUpperCase()

    // Check for payment in MongoDB - handle both field name formats
    const payment = await db.collection("payments").findOne({
      $or: [{ registrationId: normalizedId }, { registrationid: normalizedId }],
      status: "PAID",
    })

    if (!payment) {
      return NextResponse.json({
        success: true,
        verified: false,
        message: "No payment record found for this registration ID. Please complete payment to continue.",
      })
    }

    // Set cookie with registration ID
    cookies().set("registration_id", normalizedId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "strict",
    })

    // Get the first clue for the user
    const firstClue = await db.collection("qrcodes").findOne({ componentId: "led" })

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Registration verified successfully",
      registrationId: normalizedId,
      firstClue: firstClue
        ? {
            id: firstClue.id,
            componentId: firstClue.componentId,
            clue: firstClue.clue,
            hint: firstClue.hint,
            difficulty: firstClue.difficulty,
          }
        : null,
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

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration ID is required",
        },
        { status: 400 },
      )
    }

    // Check if verification is enabled
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })
    const verificationEnabled = settings ? settings.verificationEnabled : true

    // If verification is disabled, automatically approve
    if (!verificationEnabled) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: "Verification bypassed - system in open access mode",
      })
    }

    // Normalize the registration ID
    const normalizedId = registrationId.trim().toUpperCase()

    // Check for payment in MongoDB - handle both field name formats
    const payment = await db.collection("payments").findOne({
      $or: [{ registrationId: normalizedId }, { registrationid: normalizedId }],
      status: "PAID",
    })

    if (!payment) {
      return NextResponse.json({
        success: true,
        verified: false,
        message: "No payment record found for this registration ID. Please complete payment to continue.",
      })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Registration verified successfully",
      userData: {
        registrationId: normalizedId,
        name: payment.name || "",
        email: payment.email || "",
      },
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

