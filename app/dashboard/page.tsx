"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Trophy, MapPin, Mail, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getRandomClueForComponent } from "@/lib/clue-manager"

interface Component {
  id: string
  name: string
  description: string
  image?: string
}

interface Clue {
  componentId: string
  clue: string
  hint: string
  difficulty: string
}

export default function DashboardPage() {
  const [progress, setProgress] = useState(0)
  const [rank, setRank] = useState(0)
  const [collectedComponents, setCollectedComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextClue, setNextClue] = useState<Clue | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showPrizeDetails, setShowPrizeDetails] = useState(false)
  const router = useRouter()

  // Fetch user progress on load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Get stored device token if available
        const storedToken = localStorage.getItem("device_token") || ""
        const registrationId = localStorage.getItem("registration_id") || ""

        if (!registrationId) {
          // No registration ID, redirect to home
          router.push("/")
          return
        }

        // Fetch the first component to get progress
        const response = await fetch(`/api/scan?id=check-progress${storedToken ? `&token=${storedToken}` : ""}`)
        const data = await response.json()

        if (response.status === 200) {
          if (data.status === "registration_required" || data.status === "payment_required") {
            // No registration or payment, redirect to home
            router.push("/")
            return
          }

          // Set progress data
          if (data.status === "success" || data.status === "already_scanned") {
            setProgress(data.progress)
            setCollectedComponents(data.collectedComponents || [])
            if (data.rank) setRank(data.rank)

            // Find next clue based on collected components
            if (data.collectedComponents && data.collectedComponents.length < 5) {
              // Get the next clue from the API
              const clueResponse = await fetch(`/api/clues/next?registration_id=${registrationId}`)
              const clueData = await clueResponse.json()

              if (clueResponse.ok && clueData.clue) {
                setNextClue(clueData.clue)

                // Also get a random clue from our client-side manager
                // This ensures we have a clue even if the API fails
                try {
                  const nextComponentId = data.progress + 1
                  if (nextComponentId <= 5) {
                    const randomClue = getRandomClueForComponent(nextComponentId)
                    // Use this clue if we didn't get one from the API
                    if (!clueData.clue) {
                      setNextClue({
                        componentId: String(nextComponentId),
                        clue: randomClue.clue,
                        hint: randomClue.hint,
                        difficulty: "Variable",
                      })
                    }
                  }
                } catch (err) {
                  console.error("Error getting random clue:", err)
                }
              }
            }

            // If hunt is complete, redirect to completion page
            if (data.complete) {
              router.push("/completion")
              return
            }
          }
        } else {
          setError("Failed to load progress")
        }
      } catch (err) {
        console.error("Error fetching progress:", err)
        setError("Failed to connect to server")
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [router])

  const handleContactClick = () => {
    window.location.href =
      "mailto:shaikrohaz@gmail.com?subject=QR%20Scavenger%20Hunt%20Support&body=I%20need%20assistance%20with%20the%20QR%20scavenger%20hunt."
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Loading your hunt progress...</div>
      </main>
    )
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

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold mb-6 text-white"
        >
          Your Treasure Hunt
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm"
          >
            {error}
          </motion.div>
        )}

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-purple-200 mb-2">Components Collected</p>
          <Progress value={(progress / 5) * 100} className="h-3 bg-white/10" />
          <div className="flex justify-between mt-2 text-sm text-purple-200">
            <span>{progress} of 5 collected</span>
            <span>{5 - progress} remaining</span>
          </div>
        </motion.div>

        {rank > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-300 mr-2" />
                <span className="text-white">Your Rank</span>
              </div>
              <span className="text-purple-300 font-semibold">#{rank}</span>
            </div>
            <p className="text-sm text-purple-200">
              {rank === 1 ? "You're in the lead!" : `There are ${rank - 1} hunters ahead of you`}
            </p>
          </motion.div>
        )}

        {collectedComponents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Your Collection</h3>
            <div className="grid grid-cols-5 gap-2">
              {["led", "resistor", "breadboard", "jumper-wires", "battery"].map((componentId) => {
                const collected = collectedComponents.some((c) => c.id === componentId)
                return (
                  <div
                    key={componentId}
                    className={`p-2 rounded-lg ${collected ? "bg-white/10 border border-purple-400/30" : "bg-white/5 border border-white/10"} flex flex-col items-center`}
                  >
                    <div className="text-xl mb-1">
                      {componentId === "led"
                        ? "💡"
                        : componentId === "resistor"
                          ? "🔌"
                          : componentId === "breadboard"
                            ? "🧩"
                            : componentId === "jumper-wires"
                              ? "🔌"
                              : "🔋"}
                    </div>
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-4"
        >
          {nextClue ? (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-purple-300 mr-2" />
                <h3 className="text-white font-semibold">Next Clue</h3>
              </div>
              <p className="text-sm text-purple-100 mb-3 italic">{nextClue.clue}</p>
              <p className="text-xs text-purple-300 mb-3">Difficulty: {nextClue.difficulty}</p>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <p className="text-sm text-purple-300 font-semibold mb-1">Hint:</p>
                  <p className="text-sm text-purple-100">{nextClue.hint}</p>
                </motion.div>
              )}

              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="mt-2 text-xs border-white/20 text-white hover:bg-white/10"
              >
                {showHint ? "Hide Hint" : "Need a Hint?"}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-purple-100">
              <p className="mb-2 text-sm">
                <span className="font-semibold">Next step:</span> Find and scan more QR codes with your phone&apos;s
                camera or Google Lens.
              </p>
              <p className="text-xs text-purple-200">
                Each QR code will give you a new component and a clue to find another one.
              </p>
            </div>
          )}

          <Button
            onClick={() => router.push("/components")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center"
          >
            <Trophy className="mr-2 h-4 w-4" />
            View Collection
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
        </motion.div>
      </motion.div>
    </main>
  )
}

