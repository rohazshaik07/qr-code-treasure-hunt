"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Trophy, Home, Share2, MessageSquare, Mail, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Component {
  id: string
  name: string
  description: string
  image?: string
}

export default function CompletionPage() {
  const router = useRouter()
  const [components, setComponents] = useState<Component[]>([])
  const [showPrizeDetails, setShowPrizeDetails] = useState(false)
  const [rank, setRank] = useState<number | null>(null)

  useEffect(() => {
    // Fetch components data
    const fetchComponents = async () => {
      try {
        // Get stored device token if available
        const storedToken = localStorage.getItem("device_token") || ""

        const response = await fetch(`/api/scan?id=check-progress${storedToken ? `&token=${storedToken}` : ""}`)
        const data = await response.json()

        if (data.status === "registration_required" || data.status === "payment_required") {
          // No registration or payment, redirect to home
          router.push("/")
          return
        }

        if (data.collectedComponents) {
          setComponents(data.collectedComponents)
        }

        if (data.rank) {
          setRank(data.rank)
        }
      } catch (error) {
        console.error("Error fetching components:", error)
      }
    }

    fetchComponents()

    // Trigger confetti animation on load
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(confettiInterval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Launch confetti from both sides
      confetti({
        particleCount: Math.floor(randomInRange(particleCount / 2, particleCount)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 0 },
        colors: ["#9c5fff", "#ff49db", "#0099ff", "#ffe700"],
      })

      confetti({
        particleCount: Math.floor(randomInRange(particleCount / 2, particleCount)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 1 },
        colors: ["#9c5fff", "#ff49db", "#0099ff", "#ffe700"],
      })
    }, 250)

    return () => clearInterval(confettiInterval)
  }, [router])

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

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  // Determine prize based on rank
  const getPrizeText = () => {
    if (!rank) return "Congratulations on completing the hunt!"

    if (rank === 1) {
      return "🥇 You're in 1st place! You've won a FREE Netflix Premium account and a Udemy course of your choice!"
    } else if (rank === 2) {
      return "🥈 You're in 2nd place! You've won a FREE Netflix Premium account!"
    } else if (rank === 3) {
      return "🥉 You're in 3rd place! You've won a FREE Udemy Course!"
    } else {
      return `You finished in position #${rank}. Keep an eye out for future events!`
    }
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
            <Trophy className="w-20 h-20 text-yellow-300" />
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
              className="absolute inset-0 rounded-full bg-yellow-500/30 blur-xl -z-10"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold mb-2 text-white"
        >
          Congratulations!
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-4 mb-6"
        >
          <p className="text-purple-100">You've successfully completed the Digital Treasure Hunt!</p>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-purple-100">
            <p className="font-semibold text-lg text-white mb-2">{getPrizeText()}</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-purple-400/30">
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
                Don't forget to visit the Refreshment Hub at the College Canteen to claim your free drink!
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
                  You'll receive login credentials for Netflix access and a coupon code for your Udemy course shortly.
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="py-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Components Collected</h3>
            <div className="flex justify-center space-x-4">
              {components.map((component, i) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"
                >
                  <span className="text-white">{getComponentEmoji(component.id)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Build Your Own Project!</h3>
            <p className="text-sm text-purple-100 mb-3">
              Congratulations! You've collected all components: LED, Resistor, Breadboard, Jumper Wires, and Battery.
              With these, you can make an LED glow using the battery.
            </p>
            <p className="text-sm text-purple-100">
              Connect the LED to the battery with the resistor in series, using jumper wires and the breadboard to hold
              it all together.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="space-y-4"
        >
          <Button
            onClick={() => {
              // Open WhatsApp with pre-filled message
              window.open(
                `https://wa.me/+919505956681?text=${encodeURIComponent("Hey, I've completed the hunt! Let's talk about the prize.")}`,
                "_blank",
              )
            }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Let's Talk About the Prize
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>

          {/* Add Refreshment Hub button */}
          <Button
            onClick={() =>
              alert("The Refreshment Hub is located at the College Canteen. Show your progress to claim your drink!")
            }
            variant="outline"
            className="w-full border-green-400/30 text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Coffee className="mr-2 h-4 w-4" />
            Refreshment Hub
          </Button>

          <Button
            onClick={() => {
              // In a real app, this would share the achievement
              if (navigator.share) {
                navigator.share({
                  title: "I completed the IoT Treasure Hunt!",
                  text: "I just collected all 5 IoT components in the campus treasure hunt and won amazing prizes!",
                  url: window.location.origin,
                })
              } else {
                alert("Sharing is not supported on this browser")
              }
            }}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Your Achievement
          </Button>
        </motion.div>
      </motion.div>
    </main>
  )
}

