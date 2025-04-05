import { NextResponse } from "next/server"
import { testConnection } from "@/lib/verification-service"

export async function GET(request: Request) {
  try {
    console.log("Testing MongoDB connection")

    const result = await testConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error testing MongoDB connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to MongoDB",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error,
      },
      { status: 500 },
    )
  }
}

