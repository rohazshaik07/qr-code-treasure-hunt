import { NextResponse } from "next/server"
import { getVerificationSettings } from "@/lib/mongodb"

export async function GET() {
  try {
    const { enabled } = await getVerificationSettings()

    return NextResponse.json({
      success: true,
      verificationEnabled: enabled,
    })
  } catch (error: any) {
    console.error("Error getting verification status:", error)
    return NextResponse.json({ success: false, message: error.message, verificationEnabled: true }, { status: 500 })
  }
}

