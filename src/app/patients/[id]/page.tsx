import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/db'
import { Patient } from '@/models/Patient'
import { Interaction } from '@/models/Interaction'
import InteractionForm from '@/components/InteractionForm'
import InteractionList from '@/components/InteractionList'
import CaseSummaryButton from '@/components/CaseSummaryButton'

interface Props {
  params: {
    id: string
  }
}

async function getPatientAndInteractions(patientId: string) {
  await connectDB()
  const patient = await Patient.findOne({ patientId })
  if (!patient) return null

  const interactions = await Interaction.find({ patientId }).sort({ date: -1 })
  return { patient, interactions }
}

export default async function PatientDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const data = await getPatientAndInteractions(params.id)
  
  if (!data) {
    redirect('/patients')
  }

  const { patient, interactions } = data

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Patient Information
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.firstName} {patient.lastName}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.patientId}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.contactNumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.email || '-'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.address || '-'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Medical History</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.medicalHistory?.length
                  ? patient.medicalHistory.join(', ')
                  : '-'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Allergies</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {patient.allergies?.length ? patient.allergies.join(', ') : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex justify-end">
        <CaseSummaryButton caseId={patient._id.toString()} />
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            New Interaction
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <InteractionForm patientId={patient.patientId} />
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Interaction History
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <InteractionList interactions={interactions} />
        </div>
      </div>
    </div>
  )
} 