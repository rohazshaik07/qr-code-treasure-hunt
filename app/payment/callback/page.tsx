"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("Verifying your payment...")
  const [firstClue, setFirstClue] = useState<any>(null)

  useEffect(() => {
    const orderId = searchParams.get("order_id")
    const registrationId = searchParams.get("registration_id")

    if (!orderId || !registrationId) {
      setStatus("failure")
      setMessage("Invalid payment callback. Missing order ID or registration ID.")
      return
    }

    const checkPaymentStatus = async () => {
      try {
        // Check payment status
        const response = await fetch(`/api/payment/status?order_id=${orderId}&registration_id=${registrationId}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus("failure")
          setMessage(data.error || "Failed to verify payment status.")
          return
        }

        if (data.payment.status === "PAID") {
          // Payment successful
          setStatus("success")
          setMessage("Payment successful! You can now start the hunt.")

          // Get the first clue
          const clueResponse = await fetch(`/api/clues/first?registration_id=${registrationId}`)
          const clueData = await clueResponse.json()

          if (clueResponse.ok && clueData.clue) {
            setFirstClue(clueData.clue)
          }

          // Store registration ID in localStorage for future use
          localStorage.setItem("registration_id", registrationId)
        } else if (data.payment.status === "FAILED") {
          // Payment failed
          setStatus("failure")
          setMessage("Payment failed. Please try again.")
        } else {
          // Payment pending or other status
          setStatus("loading")
          setMessage(`Payment status: ${data.payment.status}. Please wait...`)

          // Check again after 5 seconds
          setTimeout(checkPaymentStatus, 5000)
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
        setStatus("failure")
        setMessage("An error occurred while verifying your payment.")
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Payment%20Issue&body=I%20need%20assistance%20with%20my%20payment%20for%20the%20QR%20scavenger%20hunt."
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
            {status === "loading" && <Loader2 className="w-16 h-16 text-blue-300 animate-spin" />}
            {status === "success" && <CheckCircle className="w-16 h-16 text-green-300" />}
            {status === "failure" && <XCircle className="w-16 h-16 text-red-300" />}
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
          className="text-2xl font-bold mb-2 text-white"
        >
          {status === "loading" && "Processing Payment"}
          {status === "success" && "Payment Successful!"}
          {status === "failure" && "Payment Failed"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-purple-200 mb-6"
        >
          {message}
        </motion.p>

        {status === "success" && firstClue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Your First Clue</h3>
            <p className="text-sm text-purple-100 italic mb-3">{firstClue.clue}</p>
            <p className="text-xs text-purple-300">Difficulty: {firstClue.difficulty}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          {status === "success" && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              Go to Dashboard
            </Button>
          )}

          {status === "failure" && (
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              Try Again
            </Button>
          )}

          <Button
            onClick={handleContactClick}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Contact Support
          </Button>
        </div>
      </motion.div>
    </main>
  )
}

