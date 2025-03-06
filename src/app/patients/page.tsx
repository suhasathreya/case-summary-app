import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import connectDB from '@/lib/db'
import Patient from '@/models/Patient'

async function getPatients() {
  await connectDB()
  const patients = await Patient.find({}).sort({ createdAt: -1 })
  return patients
}

export default async function PatientsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const patients = await getPatients()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <Link
          href="/patients/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
        >
          Add New Patient
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {patients.length === 0 ? (
            <li className="px-6 py-4">
              <p className="text-gray-500">No patients found</p>
            </li>
          ) : (
            patients.map((patient: any) => (
              <li key={patient._id} className="hover:bg-gray-50">
                <Link href={`/patients/${patient.patientId}`} className="block">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary truncate">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          ID: {patient.patientId}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        <p className="mt-1">Gender: {patient.gender}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
} 