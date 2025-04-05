import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase, getComponentByQRCodeId, QR_CODE_MAPPINGS } from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { registrationNumber, qrId, deviceFingerprint } = await request.json()

    // Validate input
    if (!registrationNumber || !qrId) {
      return NextResponse.json({ error: "Registration number and QR code ID are required" }, { status: 400 })
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Get component data for the QR code
    let component = null

    // First check if this is one of our fixed QR codes
    if (QR_CODE_MAPPINGS[qrId]) {
      component = await getComponentByQRCodeId(qrId)
    } else {
      // If it's not one of our fixed QR codes, check if it exists in the database
      const qrCode = await db.collection("qrcodes").findOne({ id: qrId })
      if (!qrCode) {
        return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
      }

      // Get component data for the QR code
      component = await db.collection("components").findOne({ id: qrCode.componentId })
    }

    if (!component) {
      return NextResponse.json({ error: "Component data not found" }, { status: 500 })
    }

    // Check if registration number already exists
    const existingUser = await db.collection("users").findOne({ registrationNumber })

    // Generate a device token
    const deviceToken = uuidv4()

    if (existingUser) {
      // If user exists, set cookie and return success
      cookies().set("user_id", existingUser._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      })

      // Store the device token
      await db.collection("deviceTokens").insertOne({
        userId: existingUser._id.toString(),
        token: deviceToken,
        createdAt: new Date(),
        deviceFingerprint: deviceFingerprint || null,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Token expires in 5 minutes
      })

      return NextResponse.json({
        status: "success",
        message: "User already registered",
        userId: existingUser._id.toString(),
        deviceToken,
      })
    }

    // Create new user
    const newUser = {
      registrationNumber,
      createdAt: new Date(),
      scannedComponents: [component.id], // Add the first component they scanned
      progress: 1,
      lastScanTime: new Date(),
      deviceFingerprint: deviceFingerprint || null,
    }

    const result = await db.collection("users").insertOne(newUser)

    // Set cookie with user ID
    cookies().set("user_id", result.insertedId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "strict",
    })

    // Store the device token
    await db.collection("deviceTokens").insertOne({
      userId: result.insertedId.toString(),
      token: deviceToken,
      createdAt: new Date(),
      deviceFingerprint: deviceFingerprint || null,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Token expires in 5 minutes
    })

    // Record scan in scans collection
    await db.collection("scans").insertOne({
      userId: result.insertedId,
      qrId,
      componentId: component.id,
      scannedAt: new Date(),
      deviceToken,
    })

    return NextResponse.json({
      status: "success",
      message: "Registration successful",
      userId: result.insertedId.toString(),
      deviceToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

