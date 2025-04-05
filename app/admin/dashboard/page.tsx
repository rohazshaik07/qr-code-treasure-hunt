"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Users, CreditCard, RefreshCw, Loader2, UserCheck, Bug, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>({
    verifiedUsers: [],
    payments: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [verificationEnabled, setVerificationEnabled] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/admin/payments")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      setData(result)
    } catch (err: any) {
      console.error("Error fetching admin data:", err)
      setError(err.message || "An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/verification-status")
      const result = await response.json()

      if (response.ok) {
        setVerificationEnabled(result.verificationEnabled)
      }
    } catch (err) {
      console.error("Error fetching verification status:", err)
    }
  }

  const toggleVerification = async () => {
    try {
      setToggleLoading(true)

      const response = await fetch("/api/admin/toggle-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !verificationEnabled,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to toggle verification status")
      }

      setVerificationEnabled(result.verificationEnabled)

      // Show alert with current status
      alert(`Payment verification is now ${result.verificationEnabled ? "ENABLED" : "DISABLED"}.
${
  result.verificationEnabled
    ? "Users must have a valid payment record to access the hunt."
    : "All users can access the hunt without payment verification."
}`)
    } catch (err: any) {
      console.error("Error toggling verification status:", err)
      alert(`Error: ${err.message}`)
    } finally {
      setToggleLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchVerificationStatus()
  }, [])

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white mt-6">Admin Dashboard</h1>

          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Verification Toggle Section */}
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Payment Verification</h2>
              <p className="text-sm text-purple-200">
                {verificationEnabled
                  ? "Verification is ENABLED. Users must have a valid payment record to access the hunt."
                  : "Verification is DISABLED. All users can access the hunt without payment verification."}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleVerification}
                disabled={toggleLoading}
                variant={verificationEnabled ? "destructive" : "default"}
                className={`${
                  verificationEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {toggleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : verificationEnabled ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {verificationEnabled ? "Disable Verification" : "Enable Verification"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/admin/sync-payments")}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Payments
            </Button>

            <Button
              onClick={() => router.push("/admin/manual-verify")}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Manual Verification
            </Button>

            <Button
              onClick={() => router.push("/api/test-sheets-connection")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Bug className="mr-2 h-4 w-4" />
              Test MongoDB Connection
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
            </div>
          ) : (
            <Tabs defaultValue="users">
              <TabsList className="w-full bg-white/10">
                <TabsTrigger value="users" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Verified Users ({data.verifiedUsers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments ({data.payments?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-4">
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Registration ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Verified At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.verifiedUsers?.length > 0 ? (
                          data.verifiedUsers.map((user: any, index: number) => (
                            <tr key={index} className="bg-white/0 hover:bg-white/5">
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">{user.registrationId}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">{user.name || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">{user.email || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">{user.phone || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">
                                {user.timestamp ? new Date(user.timestamp).toLocaleString() : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-center text-purple-200">
                              No verified users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Registration ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.payments?.length > 0 ? (
                          data.payments.map((payment: any, index: number) => (
                            <tr key={index} className="bg-white/0 hover:bg-white/5">
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">{payment.orderId || "-"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">
                                {payment.registrationId || payment.registrationid || "-"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">₹{payment.amount}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    payment.status === "PAID"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-purple-100">
                                {payment.timestamp
                                  ? new Date(payment.timestamp).toLocaleString()
                                  : payment.time
                                    ? payment.time
                                    : "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-center text-purple-200">
                              No payments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </motion.div>
    </div>
  )
}

