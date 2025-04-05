import { NextResponse } from "next/server"
import { connectToDatabase, CLUES_AND_HINTS, isUserVerified } from "@/lib/mongodb"

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

    // Get the user's collected components
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ registrationId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const collectedComponents = user.scannedComponents || []

    // Find the first component that hasn't been collected
    const componentIds = ["led", "resistor", "breadboard", "jumper-wires", "battery"]
    const missingComponents = componentIds.filter((id) => !collectedComponents.includes(id))

    if (missingComponents.length === 0) {
      return NextResponse.json({ message: "All components collected" }, { status: 200 })
    }

    // Get the clue for the first missing component
    const nextComponentId = missingComponents[0]
    const nextClue = CLUES_AND_HINTS.find((clue) => clue.componentId === nextComponentId)

    if (!nextClue) {
      return NextResponse.json({ error: "Clue not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      clue: {
        componentId: nextClue.componentId,
        clue: nextClue.clue,
        hint: nextClue.hint,
        difficulty: nextClue.difficulty,
      },
    })
  } catch (error) {
    console.error("Error fetching next clue:", error)
    return NextResponse.json({ error: "Failed to fetch next clue" }, { status: 500 })
  }
}

