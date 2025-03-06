import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Patient from '@/models/Patient'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()

    await connectDB()

    // Check if patient ID already exists
    const existingPatient = await Patient.findOne({ patientId: data.patientId })
    if (existingPatient) {
      return new NextResponse('Patient ID already exists', { status: 400 })
    }

    const patient = await Patient.create(data)

    return NextResponse.json(patient)
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await connectDB()

    const patients = await Patient.find({}).sort({ createdAt: -1 })

    return NextResponse.json(patients)
  } catch (error: any) {
    console.error('Error fetching patients:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
} 