import { NextResponse } from "next/server"
import { getAllPaymentRecords } from "@/lib/mongodb"

// This is an admin endpoint to get all payment records
export async function GET(request: Request) {
  try {
    // In a real app, you would add authentication here
    // to ensure only admins can access this endpoint

    const records = await getAllPaymentRecords()

    return NextResponse.json({
      success: true,
      records: records.map((record) => ({
        registrationId: record.registrationId,
        orderId: record.orderId,
        paymentId: record.paymentId || "N/A",
        status: record.status,
        amount: record.amount,
        bankingName: record.bankingName || "N/A",
        paymentMethod: record.paymentMethod || "N/A",
        timestamp: record.timestamp,
        updatedAt: record.updatedAt || record.timestamp,
      })),
    })
  } catch (error) {
    console.error("Error fetching payment records:", error)
    return NextResponse.json({ error: "Failed to fetch payment records" }, { status: 500 })
  }
}

