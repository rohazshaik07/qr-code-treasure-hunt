import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid request. 'enabled' parameter must be a boolean." },
        { status: 400 },
      )
    }

    // Update settings in database
    const { db } = await connectToDatabase()

    await db
      .collection("settings")
      .updateOne({ id: "verification_settings" }, { $set: { verificationEnabled: enabled } }, { upsert: true })

    return NextResponse.json({
      success: true,
      message: `Verification ${enabled ? "enabled" : "disabled"} successfully`,
      verificationEnabled: enabled,
    })
  } catch (error: any) {
    console.error("Error toggling verification status:", error)
    return NextResponse.json({ success: false, message: `Error: ${error.message}` }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })

    // Default to enabled if no settings found
    const enabled = settings ? settings.verificationEnabled : true

    return NextResponse.json({
      success: true,
      verificationEnabled: enabled,
    })
  } catch (error: any) {
    console.error("Error getting verification status:", error)
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}`, verificationEnabled: true },
      { status: 500 },
    )
  }
}

