'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Props {
  patientId: string
}

export default function InteractionForm({ patientId }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      patientId,
      type: formData.get('type'),
      observations: formData.get('observations'),
      vitals: {
        temperature: formData.get('temperature'),
        bloodPressure: formData.get('bloodPressure'),
        heartRate: formData.get('heartRate'),
        respiratoryRate: formData.get('respiratoryRate'),
        oxygenSaturation: formData.get('oxygenSaturation'),
      },
      diagnosis: formData.get('diagnosis')?.toString().split(',').map(item => item.trim()),
      prescriptions: formData.get('prescriptions')?.toString().split('\n').map(line => {
        const [medicine, ...rest] = line.split(',').map(item => item.trim())
        const [dosage, frequency, duration] = rest
        return { medicine, dosage, frequency, duration }
      }).filter(p => p.medicine),
      tests: formData.get('tests')?.toString().split('\n').map(line => {
        const [name, result] = line.split(',').map(item => item.trim())
        return { name, result, date: new Date() }
      }).filter(t => t.name),
      notes: formData.get('notes'),
      medicalStaff: {
        id: session?.user?.id,
        name: session?.user?.name,
        role: session?.user?.role,
      },
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create interaction')
      }

      // Reset form
      e.currentTarget.reset()
      router.refresh()
    } catch (error) {
      setError('Failed to create interaction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Interaction Type
          </label>
          <select
            id="type"
            name="type"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">Select type</option>
            <option value="Consultation">Consultation</option>
            <option value="Treatment">Treatment</option>
            <option value="Test">Test</option>
            <option value="Surgery">Surgery</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            id="temperature"
            name="temperature"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">
            Blood Pressure
          </label>
          <input
            type="text"
            id="bloodPressure"
            name="bloodPressure"
            placeholder="120/80"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">
            Heart Rate (bpm)
          </label>
          <input
            type="number"
            id="heartRate"
            name="heartRate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700">
            Respiratory Rate (breaths/min)
          </label>
          <input
            type="number"
            id="respiratoryRate"
            name="respiratoryRate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="oxygenSaturation" className="block text-sm font-medium text-gray-700">
            Oxygen Saturation (%)
          </label>
          <input
            type="number"
            id="oxygenSaturation"
            name="oxygenSaturation"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
          Observations
        </label>
        <textarea
          id="observations"
          name="observations"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
          Diagnosis (comma-separated)
        </label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Hypertension, Type 2 Diabetes, etc."
        />
      </div>

      <div>
        <label htmlFor="prescriptions" className="block text-sm font-medium text-gray-700">
          Prescriptions (one per line: medicine, dosage, frequency, duration)
        </label>
        <textarea
          id="prescriptions"
          name="prescriptions"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Metformin, 500mg, twice daily, 30 days"
        />
      </div>

      <div>
        <label htmlFor="tests" className="block text-sm font-medium text-gray-700">
          Tests (one per line: name, result)
        </label>
        <textarea
          id="tests"
          name="tests"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Blood Glucose, 126 mg/dL"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {isLoading ? 'Saving...' : 'Save Interaction'}
        </button>
      </div>
    </form>
  )
} 