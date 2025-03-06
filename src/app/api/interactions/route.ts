import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Interaction from '@/models/Interaction'
import Patient from '@/models/Patient'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()

    await connectDB()

    // Verify patient exists
    const patient = await Patient.findOne({ patientId: data.patientId })
    if (!patient) {
      return new NextResponse('Patient not found', { status: 404 })
    }

    const interaction = await Interaction.create(data)

    return NextResponse.json(interaction)
  } catch (error: any) {
    console.error('Error creating interaction:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    await connectDB()

    const query = patientId ? { patientId } : {}
    const interactions = await Interaction.find(query).sort({ date: -1 })

    return NextResponse.json(interactions)
  } catch (error: any) {
    console.error('Error fetching interactions:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
} 