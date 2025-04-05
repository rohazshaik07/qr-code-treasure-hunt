import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db("scavenger-hunt")
  return { client, db }
}

// Define the fixed QR code IDs and their component mappings
export const QR_CODE_MAPPINGS = {
  "550e8400-e29b-41d4-a716-446655440000": {
    componentId: "led",
    name: "LED",
    description: "Light Emitting Diode - the basic building block of many electronic projects.",
  },
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8": {
    componentId: "resistor",
    name: "Resistor",
    description: "Controls the flow of electrical current in a circuit.",
  },
  "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d": {
    componentId: "breadboard",
    name: "Breadboard",
    description: "A construction base for prototyping electronics without soldering.",
  },
  "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed": {
    componentId: "jumper-wires",
    name: "Jumper Wires",
    description: "Wires that connect components on the breadboard.",
  },
  "f47ac10b-58cc-4372-a567-0e02b2c3d479": {
    componentId: "battery",
    name: "Battery",
    description: "Provides power to your circuit.",
  },
}

// Updated clues and hints
export const CLUES_AND_HINTS = [
  {
    componentId: "led",
    clue: "On the right side where fees are paid, a shining star is sleeping on the stairs, not up, not down, but in the middle heart.",
    hint: "Look on the middle step for a bright sticker.",
    difficulty: "Easy",
  },
  {
    componentId: "resistor",
    clue: "Where everyone eats lunch, a tiny wall that fights the electric flow is dancing near the place where food plates are born, but not where you sit.",
    hint: "Check near the food counter.",
    difficulty: "Above Easy",
  },
  {
    componentId: "breadboard",
    clue: "Where many books stay quiet, a big square bed where circuits grow is hiding under the king of tables, where old books whisper secrets.",
    hint: "Look under the biggest table in the old books area.",
    difficulty: "Hard",
  },
  {
    componentId: "jumper-wires",
    clue: "On the 1st floor where smart machines are made, thin snakes that tie machines together are sleeping behind a magic box where a tiny star blinks like a heartbeat.",
    hint: "Find a box with a blinking light on a table.",
    difficulty: "Super Hard",
  },
  {
    componentId: "battery",
    clue: "At the center of campus where grass grows under open sky, a box that feeds power to machines is hiding where the ground kisses the feet of the tallest green giant.",
    hint: "Look at the bottom of the biggest tree.",
    difficulty: "Difficult, Slightly Easier than Super Hard",
  },
]

// Add this helper function to get IoT component data
export async function getIoTComponents() {
  const { db } = await connectToDatabase()
  const components = await db.collection("components").find({}).toArray()

  // If no components exist, initialize them
  if (components.length === 0) {
    const defaultComponents = [
      {
        id: "led",
        name: "LED",
        description: "Light Emitting Diode - the basic building block of many electronic projects.",
        image: "led.png",
      },
      {
        id: "resistor",
        name: "Resistor",
        description: "Controls the flow of electrical current in a circuit.",
        image: "resistor.png",
      },
      {
        id: "breadboard",
        name: "Breadboard",
        description: "A construction base for prototyping electronics without soldering.",
        image: "breadboard.png",
      },
      {
        id: "jumper-wires",
        name: "Jumper Wires",
        description: "Wires that connect components on the breadboard.",
        image: "jumper-wires.png",
      },
      {
        id: "battery",
        name: "Battery",
        description: "Provides power to your circuit.",
        image: "battery.png",
      },
    ]

    await db.collection("components").insertMany(defaultComponents)
    return defaultComponents
  }

  return components
}

// Add function to get QR code data
export async function getQRCodes() {
  const { db } = await connectToDatabase()
  const qrCodes = await db.collection("qrcodes").find({}).toArray()

  // If no QR codes exist, initialize them with the fixed IDs and component associations
  if (qrCodes.length === 0) {
    const components = await getIoTComponents()

    // Use the fixed QR code IDs
    const qrCodeIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    ]

    // Create QR codes with fixed associations and updated clues
    const defaultQRCodes = qrCodeIds.map((id, index) => {
      // Point to the next component in a circular fashion
      const pointsToIndex = (index + 1) % 5

      return {
        id: id,
        componentId: components[index].id,
        pointsToComponentId: components[pointsToIndex].id,
        clue: CLUES_AND_HINTS[index].clue,
        hint: CLUES_AND_HINTS[index].hint,
        difficulty: CLUES_AND_HINTS[index].difficulty,
        location: `Location ${index + 1}`,
        createdAt: new Date(),
      }
    })

    await db.collection("qrcodes").insertMany(defaultQRCodes)
    return defaultQRCodes
  }

  return qrCodes
}

// Function to get component by QR code ID
export async function getComponentByQRCodeId(qrId: string) {
  // First check if this is one of our fixed QR codes
  if (QR_CODE_MAPPINGS[qrId]) {
    const { db } = await connectToDatabase()
    const component = await db.collection("components").findOne({ id: QR_CODE_MAPPINGS[qrId].componentId })

    if (component) {
      return component
    }

    // If component not found in DB, return the mapping directly
    return {
      id: QR_CODE_MAPPINGS[qrId].componentId,
      name: QR_CODE_MAPPINGS[qrId].name,
      description: QR_CODE_MAPPINGS[qrId].description,
    }
  }

  // If not a fixed QR code, try to find it in the database
  const { db } = await connectToDatabase()
  const qrCode = await db.collection("qrcodes").findOne({ id: qrId })

  if (!qrCode) {
    return null
  }

  const component = await db.collection("components").findOne({ id: qrCode.componentId })
  return component
}

// Function to validate registration ID
export function validateRegistrationId(registrationId: string): boolean {
  // Trim any leading or trailing spaces
  const trimmedId = registrationId.trim()

  // Check if it's at least 8 characters long
  if (trimmedId.length < 8) {
    return false
  }

  // Check if the 7th and 8th characters are '4' and '9'
  return trimmedId.charAt(6) === "4" && trimmedId.charAt(7) === "9"
}

// Function to normalize registration ID (trim spaces and convert to uppercase)
export function normalizeRegistrationId(registrationId: string): string {
  return registrationId.trim().toUpperCase()
}

// Function to check if a user's payment is verified
export async function isUserVerified(registrationId: string): Promise<boolean> {
  try {
    // Check if verification is enabled
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })
    const verificationEnabled = settings ? settings.verificationEnabled : true

    // If verification is disabled, automatically approve
    if (!verificationEnabled) {
      return true
    }

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    console.log(`Checking if user is verified: ${normalizedId}`)

    // Check if the registration ID exists in the payments collection with status PAID
    // Handle both field name formats
    const payment = await db.collection("payments").findOne({
      $or: [{ registrationId: normalizedId }, { registrationid: normalizedId }],
      status: "PAID",
    })

    console.log(`Payment verification result: ${!!payment}`)

    return !!payment
  } catch (error) {
    console.error("Error checking if user is verified:", error)
    return false
  }
}

// Function to get the first clue
export async function getFirstClue() {
  const { db } = await connectToDatabase()

  // Get the first QR code (LED)
  const qrCode = await db.collection("qrcodes").findOne({
    componentId: "led",
  })

  if (!qrCode) {
    // If not found, initialize QR codes and try again
    await getQRCodes()
    return db.collection("qrcodes").findOne({ componentId: "led" })
  }

  return qrCode
}

// Function to get all verified users (for admin)
export async function getAllVerifiedUsers() {
  const { db } = await connectToDatabase()

  // Get all users with PAID status from payments collection
  const payments = await db.collection("payments").find({ status: "PAID" }).toArray()

  // Map payments to verified users format
  return payments.map((payment) => ({
    registrationId: payment.registrationId || payment.registrationid || "N/A",
    fullName: payment.name || "N/A",
    transactionId: payment.orderId || "N/A",
    amount: payment.amount || 0,
    bankingName: payment.bankingName || "N/A",
    verified: true,
    timestamp: payment.timestamp || new Date(),
  }))
}

// Function to check if a user has paid
export async function hasUserPaid(registrationId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  // Check if verification is enabled
  const settings = await db.collection("settings").findOne({ id: "verification_settings" })
  const verificationEnabled = settings ? settings.verificationEnabled : true

  // If verification is disabled, automatically approve
  if (!verificationEnabled) {
    return true
  }

  // Check if the registration ID exists in the payments collection with status PAID
  // Handle both field name formats
  const payment = await db.collection("payments").findOne({
    $or: [
      { registrationId: normalizeRegistrationId(registrationId) },
      { registrationid: normalizeRegistrationId(registrationId) },
    ],
    status: "PAID",
  })

  return !!payment
}

// Function to get all payment records
export async function getAllPaymentRecords() {
  const { db } = await connectToDatabase()

  // Get all payment records
  return db.collection("payments").find({}).toArray()
}

// Function to track completion of all five components
export async function trackFullCompletion(registrationId: string): Promise<void> {
  const { db } = await connectToDatabase()

  // Normalize the registration ID
  const normalizedId = normalizeRegistrationId(registrationId)

  // Check if already in the collection
  const existing = await db.collection("completionStud").findOne({ registrationId: normalizedId })

  if (!existing) {
    // Add to the completionStud collection
    await db.collection("completionStud").insertOne({
      registrationId: normalizedId,
      completedAt: new Date(),
    })
  }
}

// Function to track completion of three components
export async function trackThreeCompletion(registrationId: string): Promise<void> {
  const { db } = await connectToDatabase()

  // Normalize the registration ID
  const normalizedId = normalizeRegistrationId(registrationId)

  // Check if already in the collection
  const existing = await db.collection("threeCompletion").findOne({ registrationId: normalizedId })

  if (!existing) {
    // Add to the threeCompletion collection
    await db.collection("threeCompletion").insertOne({
      registrationId: normalizedId,
      completedAt: new Date(),
    })
  }
}

// Function to check if user has collected three components
export async function hasCollectedThreeComponents(registrationId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  // Normalize the registration ID
  const normalizedId = normalizeRegistrationId(registrationId)

  // Check if in the threeCompletion collection
  const record = await db.collection("threeCompletion").findOne({ registrationId: normalizedId })

  return !!record
}

// Function to check if user has completed the hunt
export async function hasCompletedHunt(registrationId: string): Promise<boolean> {
  const { db } = await connectToDatabase()

  // Normalize the registration ID
  const normalizedId = normalizeRegistrationId(registrationId)

  // Check if in the completionStud collection
  const record = await db.collection("completionStud").findOne({ registrationId: normalizedId })

  return !!record
}

// Function to check if a payment exists for a registration ID
export async function getPaymentByRegistrationId(registrationId: string): Promise<any> {
  try {
    const { db } = await connectToDatabase()

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    console.log(`Looking for payment for registration ID: ${normalizedId}`)

    // Find the payment - handle both field name formats
    const payment = await db.collection("payments").findOne({
      $or: [{ registrationId: normalizedId }, { registrationid: normalizedId }],
      status: "PAID",
    })

    console.log(`Payment found: ${!!payment}`)

    return payment
  } catch (error) {
    console.error("Error getting payment by registration ID:", error)
    return null
  }
}

// Function to verify a user based on payment data
export async function verifyUserFromPayment(
  registrationId: string,
  name: string,
  email: string,
  phone: string,
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Normalize the registration ID
    const normalizedId = normalizeRegistrationId(registrationId)

    console.log(`Verifying user from payment: ${normalizedId}`)

    // Check if user already exists
    const existingUser = await db.collection("verifiedUsers").findOne({
      registrationId: normalizedId,
    })

    if (existingUser) {
      // User already verified
      console.log(`User already exists, updating verification status if needed`)

      // Update verification status if needed
      if (!existingUser.verified) {
        await db.collection("verifiedUsers").updateOne(
          { registrationId: normalizedId },
          {
            $set: {
              verified: true,
              name: name || existingUser.name,
              email: email || existingUser.email,
              phone: phone || existingUser.phone,
              updatedAt: new Date(),
            },
          },
        )
      }

      return true
    }

    // Create verified user
    console.log(`Creating new verified user for ${normalizedId}`)
    await db.collection("verifiedUsers").insertOne({
      registrationId: normalizedId,
      name,
      email,
      phone,
      verified: true,
      timestamp: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error verifying user from payment:", error)
    return false
  }
}

// Function to get verification settings
export async function getVerificationSettings(): Promise<{ enabled: boolean }> {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ id: "verification_settings" })

    // Default to enabled if no settings found
    return { enabled: settings ? settings.verificationEnabled : true }
  } catch (error) {
    console.error("Error getting verification settings:", error)
    // Default to enabled on error
    return { enabled: true }
  }
}

