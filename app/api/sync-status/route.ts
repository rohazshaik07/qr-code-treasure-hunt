import { NextResponse } from "next/server"
import { getSyncStatus } from "@/lib/mongodb-sync"

export async function GET() {
  try {
    console.log("Fetching sync status")
    const status = await getSyncStatus()

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("Error fetching sync status:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch sync status",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

