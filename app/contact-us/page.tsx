"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactUs() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitMessage("Thank you for your message! We will get back to you soon.")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage("")
      }, 5000)
    }, 1500)
  }

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

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">QR</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-white">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 text-purple-100">
            <h2 className="text-xl font-semibold mb-4 text-white">Get in Touch</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mt-1 mr-3 text-purple-300" />
                <div>
                  <h3 className="font-medium text-white">Email</h3>
                  <a href="mailto:shaikrohaz@gmail.com" className="text-purple-300 hover:underline">
                    shaikrohaz@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 mt-1 mr-3 text-purple-300" />
                <div>
                  <h3 className="font-medium text-white">Phone</h3>
                  <p>+91 9505966681</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 mt-1 mr-3 text-purple-300" />
                <div>
                  <h3 className="font-medium text-white">Event Location</h3>
                  <p>College Campus, Main Building</p>
                  <p>Hyderabad, India</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Event Hours</h2>
              <p>The QR code scavenger hunt will be held on:</p>
              <p className="font-medium mt-2">April 15, 2025</p>
              <p>10:00 AM - 4:00 PM</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-purple-100">
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-purple-100">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-purple-100">
                  Subject
                </Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-purple-100">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>

              {submitMessage && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-md text-green-200">
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

