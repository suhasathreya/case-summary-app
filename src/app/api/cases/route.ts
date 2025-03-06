import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Patient, IPatient } from '@/models/Patient'
import { Note } from '@/models/Note'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { FilterQuery } from 'mongoose'

interface CaseData {
  name?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  reasonForAdmission?: string;
  status?: 'open' | 'closed';
  id?: string;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query: FilterQuery<IPatient> = {}
    
    if (status) {
      query.status = status as 'open' | 'closed'
    }

    if (search) {
      // First try to find by case ID
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search
      } else {
        // If not a valid case ID, search by name or reason
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { reasonForAdmission: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const cases = await Patient.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const data: CaseData = await req.json()
    const { name, age, gender, reasonForAdmission } = data

    if (!name || !age || !gender || !reasonForAdmission) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newCase = await Patient.create({
      name,
      age,
      gender,
      reasonForAdmission,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json(newCase)
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const data: CaseData = await req.json()
    const { id, name, age, gender, reasonForAdmission, status } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }

    const updateData: Partial<IPatient> = {
      name,
      age,
      gender,
      reasonForAdmission,
      status,
      updatedAt: new Date()
    }

    if (status === 'closed') {
      updateData.dischargeDate = new Date()
    }

    const updatedCase = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!updatedCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }

    // Delete all notes associated with this case
    await Note.deleteMany({ patientId: id })

    // Delete the case
    const deletedCase = await Patient.findByIdAndDelete(id)

    if (!deletedCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Case deleted successfully' })
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    )
  }
} 