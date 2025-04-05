import { NextResponse } from "next/server"
import { connectToDatabase, normalizeRegistrationId } from "@/lib/mongodb"

// Detailed logging function with timestamp
function logSync(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[SYNC ${timestamp}] ${message}`, data ? JSON.stringify(data) : "")
}

// Error logging function with timestamp
function logError(message: string, error: any) {
  const timestamp = new Date().toISOString()
  console.error(`[SYNC ERROR ${timestamp}] ${message}`, error)
  console.error(`Stack: ${error.stack || "No stack trace available"}`)
}

export async function GET(request: Request) {
  try {
    logSync("Starting payment synchronization from MongoDB")

    // Get the last sync timestamp from query params
    const { searchParams } = new URL(request.url)
    const lastSyncParam = searchParams.get("lastSync")
    const lastSync = lastSyncParam ? new Date(lastSyncParam) : new Date(0) // Default to epoch if not provided
    const debug = searchParams.get("debug") === "true"

    logSync(`Last sync time: ${lastSync.toISOString()}`)
    logSync(`Debug mode: ${debug}`)

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    logSync("Connected to MongoDB")

    // Test connection to MongoDB first
    try {
      logSync("Testing connection to MongoDB")
      const paymentsCount = await db.collection("payments").countDocuments()
      logSync(`Successfully connected to MongoDB. Found ${paymentsCount} payment records.`)
    } catch (error) {
      logError("Failed to connect to MongoDB", error)
      return NextResponse.json(
        {
          error: "Failed to connect to MongoDB",
          message: error.message,
          details: debug ? error : undefined,
        },
        { status: 500 },
      )
    }

    // Fetch data from MongoDB payments collection
    logSync(`Fetching data from MongoDB payments collection`)
    let payments
    try {
      // Get payments that haven't been processed yet
      payments = await db
        .collection("payments")
        .find({
          status: "PAID",
          processedAt: { $exists: false },
        })
        .toArray()
    } catch (error) {
      logError("Failed to fetch data from MongoDB", error)
      return NextResponse.json(
        {
          error: "Failed to fetch data from MongoDB",
          message: error.message,
          details: debug ? error : undefined,
        },
        { status: 500 },
      )
    }

    logSync(`Fetched ${payments.length} unprocessed payments from MongoDB`)

    if (payments.length === 0) {
      logSync("No unprocessed payments found in MongoDB")
      return NextResponse.json({ message: "No unprocessed payments found in MongoDB" })
    }

    // If in debug mode, return the first few payments for inspection
    if (debug) {
      return NextResponse.json({
        message: "Debug mode - showing first 5 payments",
        payments: payments.slice(0, 5),
      })
    }

    // Process each payment
    const results = {
      processed: 0,
      newUsers: 0,
      updatedUsers: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as string[],
      processedPayments: [] as any[],
    }

    for (const [index, payment] of payments.entries()) {
      try {
        // Validate payment data
        if (!payment.registrationId || !payment.orderId) {
          logSync(`Payment ${index + 1} missing registration ID or order ID, skipping`, {
            orderId: payment.orderId,
            registrationId: payment.registrationId,
          })
          results.skipped++
          continue
        }

        logSync(`Processing payment ${index + 1}`, {
          orderId: payment.orderId,
          registrationId: payment.registrationId,
          name: payment.name,
          email: payment.email,
        })

        // Normalize registration ID
        const normalizedId = normalizeRegistrationId(payment.registrationId)

        // Check if user already exists
        const existingUser = await db.collection("verifiedUsers").findOne({
          registrationId: normalizedId,
        })

        if (!existingUser) {
          // Create verified user
          const userData = {
            registrationId: normalizedId,
            name: payment.name || "",
            email: payment.email || "",
            phone: payment.phone || "",
            verified: true,
            timestamp: new Date(),
            paymentOrderId: payment.orderId,
          }

          await db.collection("verifiedUsers").insertOne(userData)
          logSync(`Created verified user for registration ID ${normalizedId}`)
          results.newUsers++
        } else {
          // Update existing user with payment info if needed
          if (!existingUser.paymentOrderId) {
            await db.collection("verifiedUsers").updateOne(
              { registrationId: normalizedId },
              {
                $set: {
                  paymentOrderId: payment.orderId,
                  name: payment.name || existingUser.name,
                  email: payment.email || existingUser.email,
                  phone: payment.phone || existingUser.phone,
                  verified: true,
                  updatedAt: new Date(),
                },
              },
            )
            logSync(`Updated existing user for registration ID ${normalizedId}`)
            results.updatedUsers++
          }
        }

        // Mark payment as processed
        await db.collection("payments").updateOne(
          { _id: payment._id },
          {
            $set: {
              processedAt: new Date(),
            },
          },
        )

        results.processed++
        results.processedPayments.push(payment)
      } catch (error) {
        const errorMessage = `Error processing payment ${index + 1}: ${error.message}`
        logError(errorMessage, error)
        results.errors++
        results.errorDetails.push(errorMessage)
      }
    }

    logSync("Sync completed", results)
    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} payments, added ${results.newUsers} new verified users, updated ${results.updatedUsers} existing users`,
      results: {
        ...results,
        processedPayments: debug ? results.processedPayments : undefined,
      },
    })
  } catch (error) {
    logError("Error syncing payments", error)
    return NextResponse.json(
      {
        error: "Failed to sync payments from MongoDB",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

