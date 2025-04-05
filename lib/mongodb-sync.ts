import { connectToDatabase, normalizeRegistrationId } from "./mongodb"

// Function to verify a user based on payment data
export async function verifyUserFromPaymentData(
  registrationId: string,
  name: string,
  email: string,
  phone: string,
  orderId: string,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    // Check if user already exists
    const existingUser = await db.collection("verifiedUsers").findOne({
      registrationId: normalizedId,
    })

    if (existingUser) {
      // Update existing user with payment info if needed
      if (!existingUser.paymentOrderId) {
        await db.collection("verifiedUsers").updateOne(
          { registrationId: normalizedId },
          {
            $set: {
              paymentOrderId: orderId,
              name: name || existingUser.name,
              email: email || existingUser.email,
              phone: phone || existingUser.phone,
              verified: true,
              updatedAt: new Date(),
            },
          },
        )
      }
      return true
    }

    // Create verified user
    await db.collection("verifiedUsers").insertOne({
      registrationId: normalizedId,
      name,
      email,
      phone,
      verified: true,
      timestamp: new Date(),
      paymentOrderId: orderId,
    })

    return true
  } catch (error) {
    console.error("Error verifying user from payment data:", error)
    return false
  }
}

// Function to record a payment
export async function recordPayment(
  orderId: string,
  registrationId: string,
  name: string,
  email: string,
  phone: string,
  amount: number,
  timestamp: Date = new Date(),
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    // Check if payment already exists
    const existingPayment = await db.collection("payments").findOne({ orderId })

    if (existingPayment) {
      // Payment already recorded
      return true
    }

    // Create payment record
    await db.collection("payments").insertOne({
      orderId,
      registrationId: normalizedId,
      name,
      email,
      phone,
      amount,
      timestamp,
      status: "PAID",
      source: "google_sheets",
      createdAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error recording payment:", error)
    return false
  }
}

// Function to get the latest payments
export async function getLatestPayments(limit = 10): Promise<any[]> {
  try {
    const { db } = await connectToDatabase()

    return db.collection("payments").find({}).sort({ timestamp: -1 }).limit(limit).toArray()
  } catch (error) {
    console.error("Error getting latest payments:", error)
    return []
  }
}

// Function to get sync status
export async function getSyncStatus(): Promise<any> {
  try {
    const { db } = await connectToDatabase()

    const status = (await db.collection("syncStatus").findOne({})) || {
      lastSync: new Date(0),
      totalProcessed: 0,
      totalErrors: 0,
    }

    return status
  } catch (error) {
    console.error("Error getting sync status:", error)
    return {
      lastSync: new Date(0),
      totalProcessed: 0,
      totalErrors: 0,
      error: error.message,
    }
  }
}

// Function to update sync status
export async function updateSyncStatus(
  processed: number,
  errors: number,
  errorDetails: string[] = [],
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    const existingStatus = await db.collection("syncStatus").findOne({})

    if (existingStatus) {
      await db.collection("syncStatus").updateOne(
        {},
        {
          $set: {
            lastSync: new Date(),
            lastSyncResult: {
              processed,
              errors,
              errorDetails,
              timestamp: new Date(),
            },
          },
          $inc: {
            totalProcessed: processed,
            totalErrors: errors,
          },
        },
      )
    } else {
      await db.collection("syncStatus").insertOne({
        lastSync: new Date(),
        totalProcessed: processed,
        totalErrors: errors,
        lastSyncResult: {
          processed,
          errors,
          errorDetails,
          timestamp: new Date(),
        },
      })
    }

    return true
  } catch (error) {
    console.error("Error updating sync status:", error)
    return false
  }
}

