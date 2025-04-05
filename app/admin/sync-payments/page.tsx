"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Loader2, Clock, AlertCircle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SyncPaymentsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Fetch sync status on load
  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        setIsLoadingStatus(true)
        const response = await fetch("/api/sync-status")

        if (response.ok) {
          const data = await response.json()
          setSyncStatus(data.status)
        }
      } catch (err) {
        console.error("Error fetching sync status:", err)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    fetchSyncStatus()
  }, [])

  const handleSync = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/sync-payments")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync payments")
      }

      setResult(data)

      // Refresh sync status
      const statusResponse = await fetch("/api/sync-status")
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setSyncStatus(statusData.status)
      }
    } catch (err: any) {
      console.error("Error syncing payments:", err)
      setError(err.message || "An error occurred while syncing payments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugSync = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/sync-payments?debug=true")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync payments in debug mode")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error syncing payments in debug mode:", err)
      setError(err.message || "An error occurred while syncing payments in debug mode")
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setIsTestingConnection(true)
      setConnectionError(null)
      setConnectionTestResult(null)

      const response = await fetch(`/api/test-sheets-connection`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test connection")
      }

      setConnectionTestResult(data)
    } catch (err: any) {
      console.error("Error testing connection:", err)
      setConnectionError(err.message || "An error occurred while testing connection")
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative"
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

        <h1 className="text-2xl font-bold mb-6 text-center text-white mt-6">Sync Payments</h1>

        <div className="space-y-6">
          <p className="text-purple-100">
            This will sync payment data to the database. New payments will be processed and users will be verified
            automatically.
          </p>

          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="connection-test">
              <AccordionTrigger className="text-white">
                <Bug className="h-4 w-4 mr-2" /> Test MongoDB Connection
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {connectionError && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p>{connectionError}</p>
                      </div>
                    </div>
                  )}

                  {connectionTestResult && (
                    <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <p className="font-semibold">Connection Successful</p>
                      </div>

                      <div className="mt-2 space-y-2 text-sm">
                        <p>Collection: {connectionTestResult.dataPreview?.collectionName}</p>
                        <p>Rows Retrieved: {connectionTestResult.dataPreview?.rowCount}</p>

                        {connectionTestResult.dataPreview?.sampleRows && (
                          <Accordion type="single" collapsible>
                            <AccordionItem value="sample-data">
                              <AccordionTrigger className="text-xs">View Sample Data</AccordionTrigger>
                              <AccordionContent>
                                <pre className="text-xs overflow-auto p-2 bg-black/20 rounded-md max-h-40">
                                  {JSON.stringify(connectionTestResult.dataPreview.sampleRows, null, 2)}
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {isLoadingStatus ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
            </div>
          ) : syncStatus ? (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-purple-100">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-purple-300" />
                <p className="font-semibold text-white">Last Sync</p>
              </div>
              <p className="text-sm mb-2">
                {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : "Never"}
              </p>

              <div className="flex justify-between text-sm">
                <p>Total Processed: {syncStatus.totalProcessed || 0}</p>
                <p>Total Errors: {syncStatus.totalErrors || 0}</p>
              </div>

              {syncStatus.lastSyncResult && (
                <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                  <p className="font-semibold text-white mb-1">Last Sync Result:</p>
                  <div className="flex justify-between">
                    <p>Processed: {syncStatus.lastSyncResult.processed || 0}</p>
                    <p>Errors: {syncStatus.lastSyncResult.errors || 0}</p>
                  </div>

                  {syncStatus.lastSyncResult.errorDetails && syncStatus.lastSyncResult.errorDetails.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="errors">
                        <AccordionTrigger className="text-xs text-red-300 py-2">
                          <AlertCircle className="h-3 w-3 mr-1" /> View Error Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="text-xs text-red-200 space-y-1 mt-1">
                            {syncStatus.lastSyncResult.errorDetails.map((error: string, i: number) => (
                              <li key={i} className="border-l-2 border-red-500/30 pl-2">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>

            <Button
              onClick={handleDebugSync}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
              Debug Sync
            </Button>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p className="font-semibold">Sync Completed</p>
              </div>
              <p className="text-sm">{result.message}</p>

              {result.results && (
                <div className="mt-4 text-sm space-y-1">
                  <p>Processed: {result.results.processed}</p>
                  <p>New Users: {result.results.newUsers}</p>
                  <p>Updated Users: {result.results.updatedUsers || 0}</p>
                  <p>Skipped: {result.results.skipped || 0}</p>
                  <p>Errors: {result.results.errors}</p>

                  {result.results.errorDetails && result.results.errorDetails.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="errors">
                        <AccordionTrigger className="text-xs text-red-300 py-2">
                          <AlertCircle className="h-3 w-3 mr-1" /> View Error Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="text-xs text-red-200 space-y-1 mt-1">
                            {result.results.errorDetails.map((error: string, i: number) => (
                              <li key={i} className="border-l-2 border-red-500/30 pl-2">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {result.results.processedRows && result.results.processedRows.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="processed-rows">
                        <AccordionTrigger className="text-xs text-green-300 py-2">
                          <CheckCircle className="h-3 w-3 mr-1" /> View Processed Rows
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="text-xs overflow-auto p-2 bg-black/20 rounded-md max-h-40">
                            {JSON.stringify(result.results.processedRows, null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

