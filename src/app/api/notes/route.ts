import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Note } from '@/models/Note'
import { Patient } from '@/models/Patient'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

interface NoteData {
  patientId?: string;
  content?: string;
  visitDate?: string;
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
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    const notes = await Note.find({ patientId })
      .sort({ visitDate: -1 })
      .lean()

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
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
    
    const data: NoteData = await req.json()
    const { patientId, content, visitDate } = data

    if (!patientId || !content) {
      return NextResponse.json(
        { error: 'Patient ID and content are required' },
        { status: 400 }
      )
    }

    // Check if case is open
    const patient = await Patient.findById(patientId)
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    if (patient.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot add notes to a discharged case' },
        { status: 400 }
      )
    }

    const newNote = await Note.create({
      patientId,
      content,
      visitDate: visitDate ? new Date(visitDate) : new Date()
    })

    return NextResponse.json(newNote)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
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
    
    const data: NoteData = await req.json()
    const { id, content, visitDate } = data

    if (!id || !content) {
      return NextResponse.json(
        { error: 'Note ID and content are required' },
        { status: 400 }
      )
    }

    // Check if case is open
    const note = await Note.findById(id)
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const patient = await Patient.findById(note.patientId)
    if (!patient || patient.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot edit notes in a discharged case' },
        { status: 400 }
      )
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        content,
        visitDate: visitDate ? new Date(visitDate) : new Date()
      },
      { new: true }
    )

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
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
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Check if case is open
    const note = await Note.findById(id)
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const patient = await Patient.findById(note.patientId)
    if (!patient || patient.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot delete notes in a discharged case' },
        { status: 400 }
      )
    }

    const deletedNote = await Note.findByIdAndDelete(id)

    if (!deletedNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
} 