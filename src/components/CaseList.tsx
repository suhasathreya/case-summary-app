'use client';

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Case {
  _id: string
  name: string
  age: number
  gender: string
  reasonForAdmission: string
  status: 'open' | 'closed'
  dischargeDate?: string
  caseSummary?: string
  createdAt: string
}

export default function CaseList() {
  const { data: session } = useSession()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => {
    fetchCases()
  }, [statusFilter, search])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/cases?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }

      const data = await response.json()
      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case?')) {
      return
    }

    try {
      const response = await fetch(`/api/cases?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete case')
      }

      setCases(cases.filter(c => c._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete case')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by Case ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cases</option>
            <option value="open">Open Cases</option>
            <option value="closed">Closed Cases</option>
          </select>
          <Link
            href="/cases/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            New Case
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {cases.map((case_) => (
          <div
            key={case_._id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    Case ID: {case_._id}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {formatDate(case_.createdAt)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{case_.name}</h3>
                <p className="text-gray-600">
                  {case_.age} years • {case_.gender}
                </p>
                <p className="text-gray-600 mt-1">{case_.reasonForAdmission}</p>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      case_.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {case_.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/cases/${case_._id}`}
                  className="px-3 py-1 text-blue-500 hover:text-blue-600"
                >
                  View
                </Link>
                <Link
                  href={`/cases/${case_._id}/edit`}
                  className="px-3 py-1 text-blue-500 hover:text-blue-600"
                >
                  Edit
                </Link>
                {case_.status === 'open' && (
                  <button
                    onClick={() => handleDelete(case_._id)}
                    className="px-3 py-1 text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No cases found. Create a new case to get started.
        </div>
      )}
    </div>
  )
} 