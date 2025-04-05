import { NextResponse } from "next/server"
import { hasCollectedThreeComponents, normalizeRegistrationId } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get("registrationId")

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    // Check if the user has collected three components
    const hasThreeComponents = await hasCollectedThreeComponents(normalizedId)

    return NextResponse.json({
      success: true,
      hasThreeComponents,
    })
  } catch (error) {
    console.error("Error checking refreshment eligibility:", error)
    return NextResponse.json({ error: "Failed to check refreshment eligibility" }, { status: 500 })
  }
}

