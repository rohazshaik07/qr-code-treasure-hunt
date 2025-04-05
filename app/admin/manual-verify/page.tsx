"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ManualVerifyPage() {
  const router = useRouter()
  const [registrationId, setRegistrationId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
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

      const response = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          name,
          email,
          phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify user")
      }

      setResult(data)

      // Clear form
      setRegistrationId("")
      setName("")
      setEmail("")
      setPhone("")
    } catch (err: any) {
      console.error("Error verifying user:", err)
      setError(err.message || "An error occurred while verifying user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
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

        <h1 className="text-2xl font-bold mb-6 text-center text-white mt-6">Manual User Verification</h1>

        <div className="space-y-6">
          <p className="text-purple-100">
            Use this form to manually verify a user who has paid but is not being automatically verified. This will
            create a payment record and mark the user as verified.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="registration-id" className="text-purple-100">
                Registration ID (Required)
              </Label>
              <Input
                id="registration-id"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g., 21F41A0491"
                required
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-purple-100">
                Name (Optional)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="User's name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-purple-100">
                Email (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-purple-100">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Phone number"
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
                <UserCheck className="mr-2 h-4 w-4" />
                Verify User
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
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

