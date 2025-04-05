"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ShippingDelivery() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative"
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

        <h1 className="text-3xl font-bold mb-8 text-center text-white mt-6">Shipping and Delivery Policy</h1>

        <div className="space-y-6 text-purple-100">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Prize Delivery</h2>
            <p className="mb-2">For the QR code scavenger hunt prizes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Digital prizes (Netflix Premium accounts and Udemy courses) will be delivered via email within 7
                business days after the event conclusion
              </li>
              <li>Prize winners will be contacted using the email associated with their Registration ID</li>
              <li>Winners must respond to the prize notification email within 72 hours to claim their prize</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Refreshment Hub</h2>
            <p className="mb-2">For refreshments available after collecting three components:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Refreshments are available for in-person collection only</li>
              <li>Participants must show their collection progress on the app to claim their refreshment</li>
              <li>Refreshments must be claimed on the day of the event</li>
              <li>No delivery options are available for refreshments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Digital Content Delivery</h2>
            <p>
              All digital content, including access credentials for Netflix Premium accounts and Udemy courses, will be
              delivered via email. Please ensure your email address is correct and check your spam folder if you do not
              receive your prize within the specified timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Prize Expiration</h2>
            <p>
              Unclaimed prizes will be forfeited after 14 days from the initial prize notification. It is the
              responsibility of the winner to claim their prize within the specified timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Contact for Delivery Issues</h2>
            <p>
              If you have any issues with prize delivery or have not received your prize within the specified timeframe,
              please contact us at shaikrohaz@gmail.com.
            </p>
          </section>

          <p className="text-sm text-purple-300/70 mt-8 text-center">Last updated: March 30, 2025</p>
        </div>
      </motion.div>
    </div>
  )
}

