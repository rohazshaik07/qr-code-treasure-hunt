import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  connectToDatabase,
  getIoTComponents,
  getQRCodes,
  getComponentByQRCodeId,
  QR_CODE_MAPPINGS,
  isUserVerified,
  trackThreeCompletion,
  trackFullCompletion,
} from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const qrId = searchParams.get("id")
    const code = searchParams.get("code") // Add this line to handle both id and code parameters
    const deviceToken = searchParams.get("token") || ""

    // Use either qrId or code, whichever is provided
    const effectiveQrId = qrId || code

    if (!effectiveQrId) {
      return NextResponse.json({ error: "QR code ID is required" }, { status: 400 })
    }

    // Special case for progress check
    if (effectiveQrId === "check-progress") {
      return await handleProgressCheck()
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Validate QR code ID
    let component = null

    // First check if this is one of our fixed QR codes
    if (QR_CODE_MAPPINGS[effectiveQrId]) {
      component = await getComponentByQRCodeId(effectiveQrId)
    } else {
      // If it's not one of our fixed QR codes, check if it exists in the database
      const qrCode = await db.collection("qrcodes").findOne({ id: effectiveQrId })
      if (!qrCode) {
        return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
      }

      // Get component data for the QR code
      component = await db.collection("components").findOne({ id: qrCode.componentId })
    }

    if (!component) {
      return NextResponse.json({ error: "Component data not found" }, { status: 500 })
    }

    // Get registration ID from cookie
    const registrationIdCookie = cookies().get("registration_id")

    // If no cookie, user needs to register
    if (!registrationIdCookie) {
      return NextResponse.json({
        status: "registration_required",
        qrId: effectiveQrId,
        component,
      })
    }

    const registrationId = registrationIdCookie.value

    // Check if the user is verified
    const verified = await isUserVerified(registrationId)
    if (!verified) {
      return NextResponse.json(
        {
          status: "payment_required",
          message: "Please pay the 10 rs registration fee to access the hunt.",
        },
        { status: 403 },
      )
    }

    // Get user data
    const user = await db.collection("users").findOne({ registrationId })

    // If user not found, create one
    if (!user) {
      await db.collection("users").insertOne({
        registrationId,
        createdAt: new Date(),
        scannedComponents: [],
        progress: 0,
        lastScanTime: new Date(),
      })
    }

    // Initialize scannedComponents if it doesn't exist
    const scannedComponents = user?.scannedComponents || []

    // Check if this component has already been scanned by this user
    if (scannedComponents.includes(component.id)) {
      // Get all components the user has collected
      const components = await getIoTComponents()
      const collectedComponents = components.filter((c) => scannedComponents.includes(c.id))

      // Get the QR code data to provide the next clue
      const qrCodes = await getQRCodes()
      const qrCode = qrCodes.find((qr) => qr.id === effectiveQrId)

      if (!qrCode) {
        return NextResponse.json({ error: "QR code data not found" }, { status: 500 })
      }

      // Get the component this QR code points to
      const pointsToComponent = components.find((c) => c.id === qrCode.pointsToComponentId)

      return NextResponse.json({
        status: "already_scanned",
        message: "You've already collected this component",
        component,
        pointsToComponent,
        qrCode,
        progress: scannedComponents.length,
        collectedComponents,
        complete: scannedComponents.length >= 5,
      })
    }

    // Get total number of users who have scanned this QR code
    const scanCount = await db.collection("scans").countDocuments({ qrId: effectiveQrId })

    // Update user's scanned components
    const updatedScannedComponents = [...scannedComponents, component.id]

    // Log the update for debugging
    console.log(`Updating user ${registrationId} with component ${component.id}`)
    console.log(`Previous components: ${JSON.stringify(scannedComponents)}`)
    console.log(`Updated components: ${JSON.stringify(updatedScannedComponents)}`)

    // Add a record to the scans collection for analytics
    await db.collection("scans").insertOne({
      registrationId,
      qrId: effectiveQrId,
      componentId: component.id,
      timestamp: new Date(),
    })

    // Update the user document with the new component
    const updateResult = await db.collection("users").updateOne(
      { registrationId },
      {
        $set: {
          lastScanTime: new Date(),
          progress: updatedScannedComponents.length,
        },
        $push: { scannedComponents: component.id },
      },
    )

    // Log the update result
    console.log(`Update result: ${JSON.stringify(updateResult)}`)

    // Track completion milestones
    if (updatedScannedComponents.length === 3) {
      await trackThreeCompletion(registrationId)
    }

    if (updatedScannedComponents.length === 5) {
      await trackFullCompletion(registrationId)
    }

    // Calculate user rank based on progress and scan time
    const usersAhead = await db.collection("users").countDocuments({
      $or: [
        { progress: { $gt: updatedScannedComponents.length } },
        {
          progress: updatedScannedComponents.length,
          lastScanTime: { $lt: new Date() },
        },
      ],
    })

    // Get all components the user has collected
    const components = await getIoTComponents()
    const collectedComponents = components.filter((c) => updatedScannedComponents.includes(c.id))

    // Get the QR code data to provide the next clue
    const qrCodes = await getQRCodes()
    const qrCode = qrCodes.find((qr) => qr.id === effectiveQrId)

    if (!qrCode) {
      return NextResponse.json({ error: "QR code data not found" }, { status: 500 })
    }

    // Get the component this QR code points to
    const pointsToComponent = components.find((c) => c.id === qrCode.pointsToComponentId)

    // Check if hunt is complete (all 5 components collected)
    const isComplete = updatedScannedComponents.length >= 5

    // Generate a new device token for this scan
    const newToken = uuidv4()

    // Store the token in localStorage on the client side
    // This will be handled by the client component

    return NextResponse.json({
      status: "success",
      message: "Component collected successfully!",
      component,
      pointsToComponent,
      qrCode,
      progress: updatedScannedComponents.length,
      collectedComponents,
      scanCount,
      rank: usersAhead + 1,
      complete: isComplete,
      deviceToken: newToken,
      justCollectedThird: updatedScannedComponents.length === 3,
    })
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: "Failed to process QR code" }, { status: 500 })
  }
}

// Helper function to handle progress check
async function handleProgressCheck() {
  // Get registration ID from cookie
  const registrationIdCookie = cookies().get("registration_id")

  // If no cookie, user needs to register
  if (!registrationIdCookie) {
    return NextResponse.json({
      status: "registration_required",
    })
  }

  const registrationId = registrationIdCookie.value

  // Check if the user is verified
  const verified = await isUserVerified(registrationId)
  if (!verified) {
    return NextResponse.json(
      {
        status: "payment_required",
        message: "Please pay the 10 rs registration fee to access the hunt.",
      },
      { status: 403 },
    )
  }

  // Connect to MongoDB
  const { db } = await connectToDatabase()

  // Get user data
  const user = await db.collection("users").findOne({ registrationId })

  // If user not found, create one
  if (!user) {
    await db.collection("users").insertOne({
      registrationId,
      createdAt: new Date(),
      scannedComponents: [],
      progress: 0,
    })

    return NextResponse.json({
      status: "success",
      progress: 0,
      collectedComponents: [],
      rank: 1,
      complete: false,
    })
  }

  // Get all components the user has collected
  const components = await getIoTComponents()
  const scannedComponents = user.scannedComponents || []
  const collectedComponents = components.filter((c) => scannedComponents.includes(c.id))

  // Calculate user rank
  const usersAhead = await db.collection("users").countDocuments({
    $or: [
      { progress: { $gt: scannedComponents.length } },
      {
        progress: scannedComponents.length,
        lastScanTime: { $lt: user.lastScanTime || new Date() },
      },
    ],
  })

  // Check if hunt is complete
  const isComplete = scannedComponents.length >= 5

  return NextResponse.json({
    status: "success",
    progress: scannedComponents.length,
    collectedComponents,
    rank: usersAhead + 1,
    complete: isComplete,
  })
}

