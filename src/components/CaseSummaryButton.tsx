'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CaseSummaryButtonProps {
  caseId: string
  onSuccess?: () => void
}

export default function CaseSummaryButton({ caseId, onSuccess }: CaseSummaryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateSummary = async () => {
    if (!confirm('This will generate a summary based on all notes. Continue?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${caseId}/generate-summary`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary')
      }

      if (onSuccess) {
        onSuccess()
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={generateSummary}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Generate Summary
          </>
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
          {error.includes('quota exceeded') && (
            <div className="mt-1 text-xs">
              Note: This is a temporary limitation. Please try again later.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 