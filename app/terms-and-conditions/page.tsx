"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsAndConditions() {
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

        <h1 className="text-3xl font-bold mb-8 text-center text-white mt-6">Terms and Conditions</h1>

        <div className="space-y-6 text-purple-100">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
            <p>
              By participating in the QR code scavenger hunt, you agree to be bound by these Terms and Conditions. If
              you do not agree to these terms, please do not participate in the event.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Eligibility</h2>
            <p>
              Participation is open to registered students with a valid Registration ID. Payment of the entry fee is
              required to participate in the event.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Event Rules</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Participants must scan QR codes using their own devices</li>
              <li>Sharing of QR codes or their locations is prohibited</li>
              <li>Participants must follow all clues and instructions provided</li>
              <li>Attempting to bypass the system or cheat will result in disqualification</li>
              <li>The organizers' decision regarding prize winners is final</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Prizes</h2>
            <p className="mb-2">The following prizes are available:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>1st Prize: Free Netflix Premium account</li>
              <li>2nd Prize: Free Netflix Premium account</li>
              <li>3rd Prize: Free single Udemy course</li>
              <li>Refreshment: Available after collecting three components</li>
            </ul>
            <p className="mt-2">Prizes are non-transferable and cannot be exchanged for cash.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Intellectual Property</h2>
            <p>
              All content related to the QR code scavenger hunt, including but not limited to the website, QR codes, and
              clues, is the property of the event organizers and is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Limitation of Liability</h2>
            <p>
              The organizers are not responsible for any injuries, losses, or damages that may occur during
              participation in the event. Participants take part at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">7. Changes to Terms</h2>
            <p>
              The organizers reserve the right to modify these terms at any time. Continued participation in the event
              after any changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">8. Governing Law</h2>
            <p>These Terms and Conditions are governed by and construed in accordance with the laws of India.</p>
          </section>

          <p className="text-sm text-purple-300/70 mt-8 text-center">Last updated: March 30, 2025</p>
        </div>
      </motion.div>
    </div>
  )
}

