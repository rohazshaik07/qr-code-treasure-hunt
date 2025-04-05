import { NextResponse } from "next/server"
import { connectToDatabase, getAllVerifiedUsers } from "@/lib/mongodb"

// This is an admin endpoint to get all payment records and completion tracking
export async function GET(request: Request) {
  try {
    // In a real app, you would add authentication here
    // to ensure only admins can access this endpoint

    const { db } = await connectToDatabase()

    // Get all verified users
    const verifiedUsers = await getAllVerifiedUsers()

    // Get all users who have collected three components
    const threeCompletionUsers = await db.collection("threeCompletion").find({}).toArray()

    // Get all users who have completed the hunt
    const completionUsers = await db.collection("completionStud").find({}).toArray()

    return NextResponse.json({
      success: true,
      verifiedUsers: verifiedUsers.map((record) => ({
        registrationId: record.registrationId,
        fullName: record.fullName,
        transactionId: record.transactionId,
        amount: record.amount,
        bankingName: record.bankingName || "N/A",
        verified: record.verified,
        timestamp: record.timestamp,
      })),
      threeCompletionUsers: threeCompletionUsers.map((record) => ({
        registrationId: record.registrationId,
        completedAt: record.completedAt,
      })),
      completionUsers: completionUsers.map((record) => ({
        registrationId: record.registrationId,
        completedAt: record.completedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching admin data:", error)
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 })
  }
}

