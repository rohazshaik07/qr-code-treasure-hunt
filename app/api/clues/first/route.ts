import { NextResponse } from "next/server"
import { getFirstClue, isUserVerified } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get("registration_id")

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Check if the user is verified
    const verified = await isUserVerified(registrationId)
    if (!verified) {
      return NextResponse.json({ error: "Payment verification required to access clues" }, { status: 403 })
    }

    // Get the first clue
    const clue = await getFirstClue()

    if (!clue) {
      return NextResponse.json({ error: "Clue not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      clue: {
        id: clue.id,
        componentId: clue.componentId,
        clue: clue.clue,
        hint: clue.hint,
        difficulty: clue.difficulty,
      },
    })
  } catch (error) {
    console.error("Error fetching first clue:", error)
    return NextResponse.json({ error: "Failed to fetch first clue" }, { status: 500 })
  }
}

