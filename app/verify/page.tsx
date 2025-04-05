"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Search, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VerifyPage() {
  const router = useRouter()
  const [registrationId, setRegistrationId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!registrationId) {
      setError("Registration ID is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/verify-registration", {
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
        throw new Error(data.error || "Failed to verify registration")
      }

      setResult(data)

      // If verified, redirect to dashboard after 2 seconds
      if (data.verified) {
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err: any) {
      console.error("Error verifying registration:", err)
      setError(err.message || "An error occurred while verifying registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative"
      >
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 text-purple-200 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Contact Button */}
        <Button
          onClick={handleContactClick}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-purple-200 hover:text-white hover:bg-white/10"
          title="Contact Support"
        >
          <Mail className="h-5 w-5" />
        </Button>

        <h1 className="text-2xl font-bold mb-6 text-center text-white mt-6">Verify Registration</h1>

        <div className="space-y-6">
          <p className="text-purple-100">
            Enter your registration ID to verify your participation in the QR Scavenger Hunt.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="registration-id" className="text-purple-100">
                Registration ID
              </Label>
              <Input
                id="registration-id"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g., 24F01A4909"
                required
              />
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isLoading || !registrationId}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify Registration
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg ${result.verified ? "bg-green-500/20 border border-green-500/30 text-green-200" : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-200"}`}
            >
              <div className="flex items-center mb-2">
                {result.verified ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <p className="font-semibold">{result.verified ? "Registration Verified!" : "Verification Failed"}</p>
              </div>
              <p>{result.message}</p>

              {result.verified && (
                <div className="mt-4 text-sm">
                  <p>Redirecting to dashboard...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

