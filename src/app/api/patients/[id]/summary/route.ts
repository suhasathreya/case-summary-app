import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Patient from '@/models/Patient'
import Interaction from '@/models/Interaction'
import { generateCaseSummary } from '@/utils/huggingface'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const patient = await Patient.findById(params.id)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const interactions = await Interaction.find({ patientId: params.id })
      .sort({ date: -1 })

    // Prepare text for summarization
    const textToSummarize = `
      Patient Name: ${patient.name}
      Age: ${patient.age}
      Medical History: ${patient.medicalHistory || 'None'}
      
      Recent Interactions:
      ${interactions.map((interaction: any) => `
        Date: ${interaction.date}
        Type: ${interaction.type}
        Notes: ${interaction.notes}
        Diagnosis: ${interaction.diagnosis || 'None'}
        Prescription: ${interaction.prescription || 'None'}
      `).join('\n')}
    `

    const summary = await generateCaseSummary(textToSummarize)
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
} 