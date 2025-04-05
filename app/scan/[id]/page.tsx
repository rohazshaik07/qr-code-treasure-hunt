"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Lightbulb, ArrowRight, Info, Mail, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { v4 as uuidv4 } from "uuid"

interface Component {
  id: string
  name: string
  description: string
  image?: string
}

interface QRCode {
  id: string
  componentId: string
  pointsToComponentId: string
  clue: string
  hint: string
  location: string
}

export default function ScanPage({ params }: { params: { id: string } }) {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [component, setComponent] = useState<Component | null>(null)
  const [pointsToComponent, setPointsToComponent] = useState<Component | null>(null)
  const [qrCode, setQrCode] = useState<QRCode | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [progress, setProgress] = useState(0)
  const [collectedComponents, setCollectedComponents] = useState<Component[]>([])
  const [complete, setComplete] = useState(false)
  const [deviceToken, setDeviceToken] = useState<string>("")
  const [showPrizeDetails, setShowPrizeDetails] = useState(false)
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null)
  const router = useRouter()
  const qrId = params.id
  const [showRefreshmentNotification, setShowRefreshmentNotification] = useState(false)

  // Generate or retrieve device fingerprint
  useEffect(() => {
    // Check if we already have a device fingerprint in localStorage
    let fingerprint = localStorage.getItem("device_fingerprint")

    // If not, generate one and store it
    if (!fingerprint) {
      fingerprint = uuidv4()
      localStorage.setItem("device_fingerprint", fingerprint)
    }

    // Store the token if we get one from the API
    if (deviceToken) {
      localStorage.setItem("device_token", deviceToken)
    }
  }, [deviceToken])

  // Check if user is already registered via cookie
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        // Get stored device token if available
        const storedToken = localStorage.getItem("device_token") || ""

        // Try to scan the code to check if registration is required
        const response = await fetch(`/api/scan?id=${qrId}${storedToken ? `&token=${storedToken}` : ""}`)
        const data = await response.json()

        if (response.status === 200) {
          if (data.status === "registration_required" || data.status === "payment_required") {
            // No registration or payment, redirect to home
            router.push("/")
            return
          }

          // Set progress data
          if (data.status === "success" || data.status === "already_scanned") {
            setComponent(data.component)
            setPointsToComponent(data.pointsToComponent)
            setQrCode(data.qrCode)
            setProgress(data.progress)
            setCollectedComponents(data.collectedComponents)
            setComplete(data.complete)

            // Add this code to check if the user just collected their third component
            if (data.justCollectedThird) {
              setShowRefreshmentNotification(true)
            }

            // Store the new device token
            if (data.deviceToken) {
              setDeviceToken(data.deviceToken)
              localStorage.setItem("device_token", data.deviceToken)
            }

            // If this is the 5th component (complete), set a timer to redirect to completion page
            if (data.progress === 5) {
              const timer = window.setTimeout(() => {
                router.push("/completion")
              }, 20000) // 20 seconds
              setRedirectTimer(timer)
            } else if (data.complete) {
              router.push("/completion")
            } else {
              setIsLoading(false)
            }
          }
        } else {
          setError("Failed to process QR code")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error checking registration:", err)
        setError("Failed to connect to server")
        setIsLoading(false)
      }
    }

    checkRegistration()

    // Clean up timer on unmount
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [qrId, router, redirectTimer])

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registrationNumber) return

    setIsLoading(true)
    setError(null)

    try {
      // Get device fingerprint
      const deviceFingerprint = localStorage.getItem("device_fingerprint") || uuidv4()

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber,
          qrId,
          deviceFingerprint,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setIsLoading(false)
        return
      }

      // Store the device token
      if (data.deviceToken) {
        localStorage.setItem("device_token", data.deviceToken)
      }

      // Refresh the page to get the component data
      window.location.reload()
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to register. Please try again.")
      setIsLoading(false)
    }
  }

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Processing QR code...</div>
      </main>
    )
  }

  if (needsRegistration) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-center relative"
        >
          {/* Contact Button */}
          <Button
            onClick={handleContactClick}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-purple-200 hover:text-white hover:bg-white/10"
            title="Contact Support"
          >
            <Mail className="h-5 w-5" />
          </Button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <Sparkles className="w-16 h-16 text-purple-300" />
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl -z-10"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold mb-2 text-white"
          >
            Join the Hunt
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-purple-200 mb-4"
          >
            Enter your registration number to begin
          </motion.p>

          {component && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-sm text-purple-100 mb-2">You found your first component:</p>
              <p className="text-lg font-semibold text-white">{component.name}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-purple-400/30"
          >
            <h3 className="text-lg font-bold text-white mb-2">Grand Prizes</h3>
            <ul className="text-sm text-left text-purple-100 space-y-1 mb-3">
              <li className="font-semibold">🥇 1st Prize: Netflix Premium + Udemy Course</li>
              <li>• Netflix Premium: Unlimited ad-free streaming</li>
              <li>• Watch on 4 supported devices at a time</li>
              <li>• 4K (Ultra HD) + HDR quality</li>
              <li>• PLUS: Any Udemy course of your choice</li>
              <li className="font-semibold mt-2">🥈 2nd Prize: Free Netflix Premium</li>
              <li className="font-semibold mt-2">🥉 3rd Prize: Free single Udemy course</li>
            </ul>

            {/* Add refreshment hub information */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center mb-2">
                <Coffee className="w-5 h-5 text-green-300 mr-2" />
                <h4 className="text-sm font-semibold text-white">Refreshment Hub</h4>
              </div>
              <p className="text-xs text-purple-100">
                Collect 3 components to unlock a free drink at the Refreshment Hub located at the IOT Department HOD
                Room!
              </p>
            </div>

            <Button
              onClick={() => setShowPrizeDetails(!showPrizeDetails)}
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs border-white/20 text-white hover:bg-white/10"
            >
              {showPrizeDetails ? "Hide Details" : "Get More Details "}
            </Button>

            {showPrizeDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-3 pt-3 border-t border-white/10 text-xs"
              >
                <p className="font-semibold mb-1">Product Description:</p>
                <p className="text-purple-100 mb-2">
                  Enjoy a Netflix Premium subscription with a full 30-day guarantee and warranty, 24/7 help support, 4K
                  quality, ID and password provided, supports laptop, phone, and TV, but only one device can watch at a
                  time.
                </p>
                <p className="font-semibold mb-1">Process:</p>
                <p className="text-purple-100">
                  After payment (if applicable), you'll receive login credentials for Netflix access and a coupon code
                  for your Udemy course.
                </p>
              </motion.div>
            )}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            onSubmit={handleRegistration}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="registration" className="text-sm text-purple-100 text-left block">
                Registration Number
              </label>
              <Input
                id="registration"
                type="text"
                placeholder="Enter your registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-purple-200/50"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Start Hunt"}
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-6 text-xs text-purple-200/70"
          >
            <strong>Important:</strong> Please enable cookies to participate in the scavenger hunt.
          </motion.p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-center relative"
      >
        {/* Contact Button */}
        <Button
          onClick={handleContactClick}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-purple-200 hover:text-white hover:bg-white/10"
          title="Contact Support"
        >
          <Mail className="h-5 w-5" />
        </Button>

        {/* Redirect Timer (only shown when collecting 5th component) */}
        {redirectTimer && (
          <div className="absolute top-2 left-2 bg-purple-500/50 px-2 py-1 rounded-md text-xs text-white">
            Redirecting in {Math.ceil(20 - (Date.now() - (performance.now() - 20000)) / 1000)}s
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4 flex justify-center"
        >
          <div className="relative">
            <Lightbulb className="w-16 h-16 text-yellow-300" />
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-yellow-500/30 blur-xl -z-10"
            />
          </div>
        </motion.div>

        {component && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <h1 className="text-2xl font-bold text-white mb-1">
              {progress === 1 ? "First Component Found!" : "Component Found!"}
            </h1>
            <p className="text-purple-200 mb-4">{progress}/5 components collected</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-6 p-5 rounded-lg bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">{component?.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Collected!</span>
          </div>
          <p className="text-sm text-purple-100 mb-4">{component?.description}</p>

          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">
                {component?.id === "led"
                  ? "💡" // Light bulb
                  : component?.id === "resistor"
                    ? "🧲" // Magnet (representing resistor)
                    : component?.id === "breadboard"
                      ? "🧩" // Puzzle piece (representing breadboard)
                      : component?.id === "jumper-wires"
                        ? "🔌" // Electric plug (representing jumper wires)
                        : "🔋"}{" "}
                {/* Battery */}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Add the refreshment hub notification */}
        {showRefreshmentNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 p-5 rounded-lg bg-green-500/20 border border-green-400/30"
          >
            <div className="flex items-center mb-3">
              <Coffee className="w-6 h-6 text-green-300 mr-2" />
              <h3 className="text-lg font-semibold text-white">Refreshment Hub Unlocked!</h3>
            </div>
            <p className="text-sm text-green-100 mb-3">
              Congratulations! You've collected 3 components. Visit the Refreshment Hub at the IOT Department HOD Room
              to collect your free drink!
            </p>
            <Button
              onClick={() =>
                alert(
                  "The Refreshment Hub is located at the IOT Department HOD Room. Show your progress to claim your drink!",
                )
              }
              variant="outline"
              className="w-full border-green-400/30 text-white hover:bg-white/10"
            >
              <Coffee className="mr-2 h-4 w-4" />
              Refreshment Hub Location
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-purple-400/30"
        >
          <h3 className="text-lg font-bold text-white mb-2">Grand Prizes</h3>
          <ul className="text-sm text-left text-purple-100 space-y-1 mb-3">
            <li className="font-semibold">🥇 1st Prize: Netflix Premium + Udemy Course</li>
            <li>• Netflix Premium: Unlimited ad-free streaming</li>
            <li>• Watch on 4 supported devices at a time</li>
            <li>• 4K (Ultra HD) + HDR quality</li>
            <li>• PLUS: Any Udemy course of your choice</li>
            <li className="font-semibold mt-2">🥈 2nd Prize: Free Netflix Premium</li>
            <li className="font-semibold mt-2">🥉 3rd Prize: Free single Udemy course</li>
          </ul>

          {/* Add refreshment hub information */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center mb-2">
              <Coffee className="w-5 h-5 text-green-300 mr-2" />
              <h4 className="text-sm font-semibold text-white">Refreshment Hub</h4>
            </div>
            <p className="text-xs text-purple-100">
              Collect 3 components to unlock a free drink at the Refreshment Hub located at the IOT Department HOD Room!
            </p>
          </div>

          <Button
            onClick={() => setShowPrizeDetails(!showPrizeDetails)}
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs border-white/20 text-white hover:bg-white/10"
          >
            {showPrizeDetails ? "Hide Details" : "Get More Details "}
          </Button>

          {showPrizeDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-white/10 text-xs"
            >
              <p className="font-semibold mb-1">Product Description:</p>
              <p className="text-purple-100 mb-2">
                Enjoy a Netflix Premium subscription with a full 30-day guarantee and warranty, 24/7 help support, 4K
                quality, ID and password provided, supports laptop, phone, and TV, but only one device can watch at a
                time.
              </p>
              <p className="font-semibold mb-1">Process:</p>
              <p className="text-purple-100">
                After payment (if applicable), you'll receive login credentials for Netflix access and a coupon code for
                your Udemy course.
              </p>
            </motion.div>
          )}
        </motion.div>

        {qrCode && pointsToComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-6 p-5 rounded-lg bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Next Clue</h3>
            <p className="text-sm text-purple-100 italic mb-4">{qrCode.clue}</p>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <p className="text-sm text-purple-300 font-semibold mb-1">Hint:</p>
                <p className="text-sm text-purple-100">{qrCode.hint}</p>
              </motion.div>
            )}

            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-xs border-white/20 text-white hover:bg-white/10"
              >
                {showHint ? "Hide Hint" : "Need a Hint?"}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-xs text-purple-200">
                    <Info className="h-3 w-3 mr-1" />
                    What to find
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md backdrop-blur-xl bg-black/80 border border-white/20">
                  <DialogHeader>
                    <DialogTitle>Looking for: {pointsToComponent.name}</DialogTitle>
                    <DialogDescription>
                      This clue will lead you to the {pointsToComponent.name} component.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-purple-100">{pointsToComponent.description}</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center"
          >
            View Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={() => router.push("/components")}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            View Collected Components
          </Button>

          {/* Replace this button */}
          <Button
            onClick={() =>
              alert(
                "The Refreshment Hub is located at the IOT Department HOD Room. Show your progress to claim your drink!",
              )
            }
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Coffee className="mr-2 h-4 w-4" />
            Refreshment Hub
          </Button>
        </div>
      </motion.div>
    </main>
  )
}

