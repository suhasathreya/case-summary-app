import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import { Patient } from '@/models/Patient'
import CaseForm from '@/components/CaseForm'
import Link from 'next/link'

interface CaseEditPageProps {
  params: {
    id: string
  }
}

export default async function CaseEditPage({ params }: CaseEditPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return notFound()
  }

  await connectToDatabase()
  
  const patient = await Patient.findById(params.id)
  if (!patient) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Case</h1>
        <Link
          href={`/cases/${params.id}`}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Back to Case
        </Link>
      </div>

      <CaseForm
        caseId={params.id}
        initialData={{
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          reasonForAdmission: patient.reasonForAdmission,
        }}
      />
    </div>
  )
} 