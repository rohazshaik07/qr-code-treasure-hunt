"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MapPin, ArrowLeft, Trophy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRandomClueForComponent, type Clue } from "@/lib/clue-manager"

export default function CluePage({ params }: { params: { id: string } }) {
  const [clueData, setClueData] = useState<Clue | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const clueId = Number.parseInt(params.id)

  useEffect(() => {
    // Validate clue ID and set data
    if (isNaN(clueId) || clueId < 1 || clueId > 5) {
      router.push("/dashboard")
      return
    }

    try {
      // Get a random clue for this component
      const randomClue = getRandomClueForComponent(clueId)
      setClueData(randomClue)
    } catch (err) {
      console.error("Error getting clue:", err)
      setError("Failed to load clue data")
    } finally {
      setIsLoading(false)
    }
  }, [clueId, router])

  // Function to refresh the clue (get a new random one)
  const handleRefreshClue = () => {
    try {
      // Reset the stored clue for this component
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`clue_${clueId}`)
      }

      // Get a new random clue
      const newClue = getRandomClueForComponent(clueId)
      setClueData(newClue)
    } catch (err) {
      console.error("Error refreshing clue:", err)
      setError("Failed to refresh clue")
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white">Loading clue...</div>
      </main>
    )
  }

  if (error || !clueData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-white bg-red-500/20 p-4 rounded-lg">{error || "Failed to load clue data"}</div>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-center"
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
          <h2 className="text-xl font-semibold text-white">Clue #{clueId}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshClue}
            className="text-purple-200 hover:text-white hover:bg-white/10"
            title="Get a different clue"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <MapPin className="w-16 h-16 text-purple-300" />
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
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{clueData.title}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8 p-5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 text-purple-100"
        >
          <p className="italic">{clueData.clue}</p>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <p className="text-sm text-purple-300 font-semibold mb-1">Hint:</p>
              <p className="text-sm">{clueData.hint}</p>
            </motion.div>
          )}
        </motion.div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-purple-200">
              Use your phone&apos;s camera or Google Lens to scan the QR code at this location.
            </p>
          </div>

          <Button
            onClick={() => router.push("/components")}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center"
          >
            <Trophy className="mr-2 h-4 w-4" />
            View Collection
          </Button>

          <Button
            onClick={() => setShowHint(!showHint)}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            {showHint ? "Hide Hint" : "Need a Hint?"}
          </Button>
        </div>
      </motion.div>
    </main>
  )
}

