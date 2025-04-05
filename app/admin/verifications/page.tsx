"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw, Loader2, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminVerificationsPage() {
  const router = useRouter()
  const [registrationId, setRegistrationId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setIsTestingConnection(true)
      setError(null)
      setConnectionResult(null)

      const response = await fetch("/api/verify-registration?test=true")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test connection")
      }

      setConnectionResult(data)
    } catch (err: any) {
      console.error("Error testing connection:", err)
      setError(err.message || "An error occurred while testing connection")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleVerify = async () => {
    if (!registrationId) {
      setError("Registration ID is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setVerificationResult(null)

      const response = await fetch(`/api/verify-registration?registrationId=${encodeURIComponent(registrationId)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify registration")
      }

      setVerificationResult(data)
    } catch (err: any) {
      console.error("Error verifying registration:", err)
      setError(err.message || "An error occurred while verifying registration")
    } finally {
      setIsLoading(false)
    }
  }

  // Test connection on page load
  useEffect(() => {
    testConnection()
  }, [])

  // Function to download sample data as CSV
  const downloadSampleData = () => {
    if (!connectionResult || !connectionResult.dataPreview) return

    const headers = connectionResult.dataPreview.headers || []
    const rows = connectionResult.dataPreview.sampleRows || []

    // Create CSV content
    let csvContent = headers.join(",") + "\n"
    rows.forEach((row: any[]) => {
      csvContent += row.join(",") + "\n"
    })

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "registration_data_sample.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

        <h1 className="text-2xl font-bold mb-6 text-center text-white mt-6">Registration Verification Admin</h1>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Google Sheets Connection</h2>

              <Button
                onClick={testConnection}
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isTestingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Test Connection
              </Button>
            </div>

            {isTestingConnection ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
              </div>
            ) : connectionResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-200 mb-1">Spreadsheet Title:</p>
                    <p className="text-white">{connectionResult.spreadsheetInfo?.title || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-200 mb-1">Spreadsheet ID:</p>
                    <p className="text-white text-sm break-all">
                      {connectionResult.spreadsheetInfo?.spreadsheetId || "Unknown"}
                    </p>
                  </div>
                </div>

                {connectionResult.dataPreview && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-purple-200">
                        Data Preview ({connectionResult.dataPreview.rowCount} rows):
                      </p>

                      <Button
                        onClick={downloadSampleData}
                        variant="ghost"
                        size="sm"
                        className="text-purple-200 hover:text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Sample
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            {connectionResult.dataPreview.headers &&
                              connectionResult.dataPreview.headers.map((header: string, index: number) => (
                                <th
                                  key={index}
                                  className="px-4 py-2 text-left text-xs font-medium text-purple-300 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {connectionResult.dataPreview.sampleRows &&
                            connectionResult.dataPreview.sampleRows.map((row: any[], rowIndex: number) => (
                              <tr key={rowIndex} className="bg-white/0 hover:bg-white/5">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-purple-100">
                                    {cell || "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
                <p>{error}</p>
              </div>
            ) : null}
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Verify Registration</h2>

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <Label htmlFor="registration-id" className="text-purple-100">
                    Registration ID
                  </Label>
                  <Input
                    id="registration-id"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="e.g., 24F01A4909"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || !registrationId}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white h-10"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Verify
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <div
                  className={`p-4 rounded-lg ${verificationResult.verified ? "bg-green-500/20 border border-green-500/30 text-green-200" : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-200"}`}
                >
                  <div className="flex items-center mb-2">
                    <p className="font-semibold">
                      {verificationResult.verified ? "Registration Verified!" : "Verification Failed"}
                    </p>
                  </div>
                  <p>{verificationResult.message}</p>

                  {verificationResult.userData && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm font-semibold">User Details:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="opacity-70">Registration ID:</span>{" "}
                          {verificationResult.userData.registrationId}
                        </div>
                        <div>
                          <span className="opacity-70">Name:</span> {verificationResult.userData.name || "-"}
                        </div>
                        <div>
                          <span className="opacity-70">Email:</span> {verificationResult.userData.email || "-"}
                        </div>
                        <div>
                          <span className="opacity-70">Transaction ID:</span>{" "}
                          {verificationResult.userData.transactionId || "-"}
                        </div>
                        <div>
                          <span className="opacity-70">Payment Amount:</span>{" "}
                          {verificationResult.userData.paymentAmount || "-"}
                        </div>
                        <div>
                          <span className="opacity-70">Status:</span> {verificationResult.userData.approved || "-"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/admin/dashboard")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

