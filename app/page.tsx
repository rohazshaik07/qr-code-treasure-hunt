"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Mail, CheckCircle, Loader2, ExternalLink, QrCode, Coffee, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingCookie, setCheckingCookie] = useState(true)
  const [showPrizeDetails, setShowPrizeDetails] = useState(false)
  const [registrationId, setRegistrationId] = useState("")
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [validRegistration, setValidRegistration] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [firstClue, setFirstClue] = useState<any>(null)
  const [verificationEnabled, setVerificationEnabled] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch("/api/verification-status")
        if (response.ok) {
          const data = await response.json()
          setVerificationEnabled(data.verificationEnabled)
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      }
    }

    checkVerificationStatus()
  }, [])

  // Check if user is already verified
  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Check if we have a registration ID in localStorage
        const storedRegistrationId = localStorage.getItem("registration_id")

        if (storedRegistrationId) {
          // Check if this registration ID is verified
          const response = await fetch(`/api/verify?registrationId=${storedRegistrationId}`)
          const data = await response.json()

          if (response.ok && data.verified) {
            // User is verified, redirect to dashboard
            router.push("/dashboard")
            return
          }
        }

        // Check for error in URL
        const errorParam = searchParams.get("error")
        if (errorParam === "not_verified") {
          setError("Please pay the 10 rs registration fee to access the hunt.")
        } else if (errorParam === "verification_error") {
          setError("Error verifying your payment. Please try again.")
        }

        setCheckingCookie(false)
      } catch (err) {
        console.error("Error checking verification:", err)
        setError("Failed to connect to server")
        setCheckingCookie(false)
      }
    }

    checkVerification()
  }, [router, searchParams])

  // Validate registration ID
  const validateRegistration = () => {
    // Clear previous errors
    setRegistrationError(null)
    setValidRegistration(false)

    // Trim the registration ID and convert to uppercase
    const normalizedId = registrationId.trim().toUpperCase()

    // Check if it's empty
    if (!normalizedId) {
      setRegistrationError("Registration ID is required")
      return
    }

    // Check if it's at least 8 characters
    if (normalizedId.length < 8) {
      setRegistrationError("Registration ID must be at least 8 characters")
      return
    }

    // Check if the 7th and 8th characters are '4' and '9'
    if (normalizedId.charAt(6) !== "4" || normalizedId.charAt(7) !== "9") {
      setRegistrationError("Invalid Registration ID. The 7th and 8th digits must be 4 and 9 for IoT branch students.")
      return
    }

    // Valid registration ID
    setValidRegistration(true)
    // Update the input field with the normalized value
    setRegistrationId(normalizedId)
  }

  // Handle registration ID change
  const handleRegistrationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationId(e.target.value)
    // Clear validation when typing
    setRegistrationError(null)
    setValidRegistration(false)
  }

  // Handle registration ID key press (Enter)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateRegistration()
      if (validRegistration || registrationId.trim().toUpperCase().length >= 8) {
        handleVerify()
      }
    }
  }

  // Handle verification
  const handleVerify = async () => {
    try {
      setVerifying(true)
      setError(null)

      // Validate registration ID again
      validateRegistration()
      if (!validRegistration && registrationId.trim().toUpperCase().length < 8) {
        setVerifying(false)
        return
      }

      // Verify registration
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to verify registration")
        setVerifying(false)
        return
      }

      if (!data.verified) {
        setError(data.message || "Registration ID not verified. Please complete payment.")
        setVerifying(false)
        return
      }

      // Registration verified
      setVerified(true)
      setFirstClue(data.firstClue)

      // Store registration ID in localStorage
      localStorage.setItem("registration_id", data.registrationId || registrationId.trim().toUpperCase())

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Error verifying registration:", err)
      setError("Failed to verify registration")
      setVerifying(false)
    }
  }

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  if (checkingCookie) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Loading...</div>
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
          Campus Treasure Hunt
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-purple-200 mb-6"
        >
          Join the IoT branch scavenger hunt and win amazing prizes!
        </motion.p>

        {!verificationEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-200 text-sm flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Open access mode is enabled. All users can participate without payment verification.</span>
          </motion.div>
        )}

        {/* Update the grand prize section to include refreshment hub information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
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
            {showPrizeDetails ? "Hide Details" : "Get More Details"}
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
                After completing the hunt, you'll receive login credentials for Netflix access and a coupon code for
                your Udemy course.
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

        {!verified ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="space-y-6"
          >
            {verificationEnabled && (
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 text-purple-100">
                <p className="mb-4 font-semibold text-white">Payment Instructions</p>

                <div className="space-y-4">
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Pay the 10 rs registration fee via our secure payment gateway</li>
                    <li>Your payment will be automatically verified in our system</li>
                    <li>Enter your Registration ID below to access the treasure hunt</li>
                  </ol>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      onClick={() => window.open("https://payments.cashfree.com/forms/gameTresureHunt", "_blank")}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Complete Payment
                    </Button>

                    <Button
                      onClick={() => {
                        // Copy UPI ID to clipboard
                        navigator.clipboard.writeText("9505966681@axl")
                        alert("UPI ID copied to clipboard!")
                      }}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Copy UPI ID
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <Label htmlFor="registration-id" className="text-sm text-left block">
                  Registration ID
                </Label>
                <Input
                  id="registration-id"
                  type="text"
                  placeholder="Enter your registration ID"
                  value={registrationId}
                  onChange={handleRegistrationIdChange}
                  onBlur={validateRegistration}
                  onKeyPress={handleKeyPress}
                  className="bg-white/5 border-white/10 text-white placeholder:text-purple-200/50"
                />

                {registrationError && <p className="text-xs text-red-300 text-left mt-1">{registrationError}</p>}

                {validRegistration && (
                  <p className="text-xs text-green-300 text-left mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Valid Registration ID
                  </p>
                )}

                <p className="text-xs text-purple-200/70 text-left mt-1">
                  Only IoT Branch students can participate. Sorry bro if you aren't!
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={(!validRegistration && registrationId.trim().toUpperCase().length < 8) || verifying}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="p-5 rounded-lg bg-green-500/20 border border-green-400/30 text-white">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
              <p className="font-semibold text-lg">Registration Verified!</p>
              <p className="text-sm text-green-200 mt-1">Redirecting to dashboard...</p>
            </div>

            {firstClue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Your First Clue</h3>
                <p className="text-sm text-purple-100 italic mb-3">Check your first clue on dashboard!</p>
                <p className="text-xs text-purple-300">Difficulty: {firstClue.difficulty}</p>
              </motion.div>
            )}
          </motion.div>
        )}

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

