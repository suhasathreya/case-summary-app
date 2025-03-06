import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import CaseForm from '@/components/CaseForm'
import Link from 'next/link'

export default async function NewCasePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">New Case</h1>
        <Link
          href="/"
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Back to Cases
        </Link>
      </div>

      <CaseForm />
    </div>
  )
} 