"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
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

        <h1 className="text-3xl font-bold mb-8 text-center text-white mt-6">Privacy Policy</h1>

        <div className="space-y-6 text-purple-100">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Information We Collect</h2>
            <p className="mb-2">
              When you participate in our QR code scavenger hunt, we collect the following information:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Registration ID</li>
              <li>Payment information (for verification purposes only)</li>
              <li>QR code scan data</li>
              <li>Component collection progress</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verifying your participation in the event</li>
              <li>Tracking your progress in the scavenger hunt</li>
              <li>Determining prize eligibility</li>
              <li>Improving the event experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. Your data is stored in
              secure MongoDB databases and is only accessible to authorized event administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Data Retention</h2>
            <p>
              We retain your information only for the duration of the event and for a reasonable period afterward to
              distribute prizes and analyze event performance. After this period, your personal data will be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:shaikrohaz@gmail.com" className="text-purple-300 hover:underline">
                shaikrohaz@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify participants of any changes by posting
              the new Privacy Policy on this page.
            </p>
          </section>

          <p className="text-sm text-purple-300/70 mt-8 text-center">Last updated: March 30, 2025</p>
        </div>
      </motion.div>
    </div>
  )
}

