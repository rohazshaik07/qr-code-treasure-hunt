import { NextResponse } from "next/server"
import { hasCompletedHunt, normalizeRegistrationId } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get("registrationId")

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    // Check if the user has completed the hunt
    const hasCompleted = await hasCompletedHunt(normalizedId)

    return NextResponse.json({
      success: true,
      hasCompleted,
    })
  } catch (error) {
    console.error("Error checking completion status:", error)
    return NextResponse.json({ error: "Failed to check completion status" }, { status: 500 })
  }
}

