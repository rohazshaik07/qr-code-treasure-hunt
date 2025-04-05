"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function QRCodePage({ params }: { params: { code: string } }) {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const router = useRouter()
  const code = params.code

  // Check if user is already registered via cookie
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        // Try to scan the code to check if registration is required
        const response = await fetch(`/api/scan?code=${code}`)
        const data = await response.json()

        if (response.status === 200) {
          if (data.status === "registration_required") {
            // User needs to register
            setNeedsRegistration(true)
            setIsLoading(false)
          } else if (data.status === "success") {
            // User is registered and scan was successful

            // Store the device token in localStorage
            if (data.deviceToken) {
              localStorage.setItem("device_token", data.deviceToken)
            }

            // Store the component ID that was just collected
            if (data.component && data.component.id) {
              const collectedComponents = JSON.parse(localStorage.getItem("collected_components") || "[]")
              if (!collectedComponents.includes(data.component.id)) {
                collectedComponents.push(data.component.id)
                localStorage.setItem("collected_components", JSON.stringify(collectedComponents))
              }
            }

            if (data.complete) {
              router.push("/completion")
            } else {
              router.push(`/clue/${data.progress}`)
            }
          } else if (data.status === "already_scanned") {
            // User already scanned this code
            router.push(`/clue/${data.progress}`)
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
  }, [code, router])

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registrationNumber) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber,
          code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setIsLoading(false)
        return
      }

      // Store registration ID in localStorage for reference
      localStorage.setItem("registration_id", registrationNumber)

      // Registration successful, redirect to clue page
      router.push("/clue/1")
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to register. Please try again.")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Processing QR code...</div>
      </main>
    )
  }

  if (!needsRegistration) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Redirecting...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-center"
      >
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
          className="text-purple-200 mb-8"
        >
          Enter your registration number to begin
        </motion.p>

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

