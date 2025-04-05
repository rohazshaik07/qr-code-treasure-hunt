import { connectToDatabase, normalizeRegistrationId } from "@/lib/mongodb"

// Function to check if verification is enabled
export async function isVerificationEnabled(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })

    // Default to enabled if no settings found
    return settings ? settings.verificationEnabled : true
  } catch (error) {
    console.error("Error checking verification status:", error)
    // Default to enabled on error
    return true
  }
}

// Function to toggle verification status
export async function toggleVerificationStatus(enabled: boolean): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    await db
      .collection("settings")
      .updateOne({ id: "verification_settings" }, { $set: { verificationEnabled: enabled } }, { upsert: true })

    return true
  } catch (error) {
    console.error("Error toggling verification status:", error)
    return false
  }
}

// Main verification function
export async function verifyRegistration(registrationId: string) {
  try {
    // Check if verification is enabled
    const verificationEnabled = await isVerificationEnabled()

    // If verification is disabled, automatically approve
    if (!verificationEnabled) {
      return {
        success: true,
        verified: true,
        message: "Verification bypassed - system in open access mode",
        userData: {
          registrationId: normalizeRegistrationId(registrationId),
          name: "Auto-approved User",
          email: "",
        },
      }
    }

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Check for payment in MongoDB - handle both field name formats
    const payment = await db.collection("payments").findOne({
      $or: [{ registrationId: normalizedId }, { registrationid: normalizedId }],
      status: "PAID",
    })

    if (!payment) {
      return {
        success: true,
        verified: false,
        message: "No payment record found for this registration ID. Please complete payment to continue.",
      }
    }

    // Payment found, user is verified
    return {
      success: true,
      verified: true,
      message: "Registration verified successfully",
      userData: {
        registrationId: normalizedId,
        name: payment.name || "",
        email: payment.email || "",
        transactionId: payment.orderId || payment.transactionId || "",
      },
    }
  } catch (error: any) {
    console.error("Error verifying registration:", error)
    return {
      success: false,
      verified: false,
      message: `Verification error: ${error.message}`,
    }
  }
}

// Test connection to MongoDB
export async function testConnection() {
  try {
    const { db } = await connectToDatabase()

    // Test query
    const result = await db.collection("payments").countDocuments()

    return {
      success: true,
      message: `Connection successful. Found ${result} payment records.`,
      count: result,
    }
  } catch (error: any) {
    console.error("Error testing connection:", error)
    return {
      success: false,
      message: `Connection error: ${error.message}`,
    }
  }
}

