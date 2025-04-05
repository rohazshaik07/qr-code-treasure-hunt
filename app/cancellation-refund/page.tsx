"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CancellationRefund() {
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

        <h1 className="text-3xl font-bold mb-8 text-center text-white mt-6">Cancellation and Refund Policy</h1>

        <div className="space-y-6 text-purple-100">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Registration Fee</h2>
            <p>
              The registration fee for the QR code scavenger hunt is non-refundable once payment has been verified and
              participation has been confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Cancellation by Participant</h2>
            <p className="mb-2">If you need to cancel your participation:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Cancellations made at least 48 hours before the event may be eligible for a partial refund (50% of the
                registration fee)
              </li>
              <li>Cancellations made less than 48 hours before the event are not eligible for a refund</li>
              <li>All cancellation requests must be sent to shaikrohaz@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Cancellation by Organizers</h2>
            <p className="mb-2">If the event is cancelled by the organizers:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refunds will be provided to all registered participants</li>
              <li>Refunds will be processed within 7-10 business days</li>
              <li>Participants will be notified via email about the cancellation and refund process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Event Postponement</h2>
            <p>
              If the event is postponed, registered participants will have the option to either participate on the new
              date or request a refund. Refund requests in case of postponement must be made within 48 hours of the
              postponement announcement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Technical Issues</h2>
            <p>
              If you experience technical issues that prevent you from participating in the event, please contact us
              immediately at shaikrohaz@gmail.com. Refunds for technical issues will be evaluated on a case-by-case
              basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Refund Process</h2>
            <p>
              All approved refunds will be processed using the same payment method used for the original transaction.
              Processing time may vary depending on your payment provider.
            </p>
          </section>

          <p className="text-sm text-purple-300/70 mt-8 text-center">Last updated: March 30, 2025</p>
        </div>
      </motion.div>
    </div>
  )
}

