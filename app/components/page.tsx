"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Component {
  id: string
  name: string
  description: string
  image?: string
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [collectedComponents, setCollectedComponents] = useState<string[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrizeDetails, setShowPrizeDetails] = useState(false)
  const router = useRouter()

  // Fetch user's collected components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        // Get stored device token if available
        const storedToken = localStorage.getItem("device_token") || ""
        const registrationId = localStorage.getItem("registration_id") || ""

        if (!registrationId) {
          // No registration ID, redirect to home
          router.push("/")
          return
        }

        // Fetch progress to determine collected components
        const response = await fetch(`/api/scan?id=check-progress${storedToken ? `&token=${storedToken}` : ""}`)
        const data = await response.json()

        if (response.status === 200) {
          if (data.status === "registration_required" || data.status === "payment_required") {
            // No registration or payment, redirect to home
            router.push("/")
            return
          }

          // Set collected components
          if (data.collectedComponents) {
            setComponents(data.collectedComponents)
            setCollectedComponents(data.collectedComponents.map((c: Component) => c.id))
          }
        }
      } catch (err) {
        console.error("Error fetching components:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchComponents()
  }, [router])

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Loading your components...</div>
      </main>
    )
  }

  // Get the emoji for each component
  const getComponentEmoji = (id: string) => {
    switch (id) {
      case "led":
        return "💡" // Light bulb
      case "resistor":
        return "🧲" // Magnet (representing resistor)
      case "breadboard":
        return "🧩" // Puzzle piece (representing breadboard)
      case "jumper-wires":
        return "🔌" // Electric plug (representing jumper wires)
      case "battery":
        return "🔋" // Battery
      default:
        return "🔍" // Magnifying glass (default)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative"
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-purple-200 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-white">Your Components</h2>

          {/* Contact Button */}
          <Button
            onClick={handleContactClick}
            variant="ghost"
            size="icon"
            className="text-purple-200 hover:text-white hover:bg-white/10"
            title="Contact Support"
          >
            <Mail className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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

        <div className="space-y-4 mb-6">
          {components.length > 0 ? (
            components.map((component, index) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                className="p-4 rounded-lg bg-white/10 border border-purple-400/30 cursor-pointer transition-all hover:bg-white/15"
                onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center mr-3 text-xl">
                      {getComponentEmoji(component.id)}
                    </div>
                    <span className="font-medium text-white">{component.name}</span>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Collected</div>
                </div>

                {selectedComponent === component.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <p className="text-sm text-purple-100">{component.description}</p>
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              <p className="text-purple-200">You haven't collected any components yet.</p>
              <p className="text-sm text-purple-300 mt-2">Scan QR codes to collect IoT components!</p>
            </div>
          )}
        </div>

        {/* Show missing components */}
        {components.length > 0 && components.length < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <h3 className="text-md font-semibold text-white mb-3">Still Missing:</h3>
            <div className="grid grid-cols-5 gap-2">
              {["led", "resistor", "breadboard", "jumper-wires", "battery"].map((componentId) => {
                const collected = collectedComponents.includes(componentId)
                return (
                  <div
                    key={componentId}
                    className={`p-2 rounded-lg ${collected ? "bg-white/10 border border-purple-400/30" : "bg-white/5 border border-white/10"} flex flex-col items-center`}
                  >
                    <div className="text-xl mb-1">{getComponentEmoji(componentId)}</div>
                    <span className={`text-xs ${collected ? "text-purple-200" : "text-purple-200/50"}`}>
                      {componentId === "led"
                        ? "LED"
                        : componentId === "resistor"
                          ? "Resistor"
                          : componentId === "breadboard"
                            ? "Board"
                            : componentId === "jumper-wires"
                              ? "Wires"
                              : "Battery"}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
          >
            Back to Dashboard
          </Button>

          {/* Replace this button */}
          <Button
            onClick={() =>
              alert(
                "The Refreshment Hub is located at the IOT Department HOD Room. Show your progress to claim your drink!",
              )
            }
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Coffee className="mr-2 h-4 w-4" />
            Refreshment Hub
          </Button>
        </div>
      </motion.div>
    </main>
  )
}

