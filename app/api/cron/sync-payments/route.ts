import { NextResponse } from "next/server"
import { updateSyncStatus } from "@/lib/mongodb-sync"

// This endpoint will be called by Vercel Cron
export async function GET(request: Request) {
  try {
    console.log("[CRON] Starting scheduled payment sync")

    // Call our sync API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://v0-qr-code-project-setup.vercel.app"}/api/sync-payments`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[CRON] Sync API returned error: ${response.status}`, errorText)
      return NextResponse.json(
        {
          success: false,
          message: "Cron job failed - sync API returned error",
          status: response.status,
          error: errorText,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // Update sync status in database
    if (data.results) {
      await updateSyncStatus(data.results.processed || 0, data.results.errors || 0, data.results.errorDetails || [])
    }

    console.log("[CRON] Sync completed successfully", data)

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      syncResults: data,
    })
  } catch (error) {
    console.error("[CRON] Error in cron job:", error)
    return NextResponse.json(
      {
        error: "Failed to execute cron job",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// Configure Vercel Cron to run every 5 minutes
export const config = {
  runtime: "edge",
  regions: ["iad1"],
}

