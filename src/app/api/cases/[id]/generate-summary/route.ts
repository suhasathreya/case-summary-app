import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Patient } from '@/models/Patient';
import { Note } from '@/models/Note';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { generateCaseSummary } from '@/lib/mistral';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // 3 requests per minute for free tier
let requestCount = 0;
let windowStart = Date.now();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const now = Date.now();
    if (now - windowStart > RATE_LIMIT_WINDOW) {
      requestCount = 0;
      windowStart = now;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few minutes.' },
        { status: 429 }
      );
    }
    
    requestCount++;

    await connectToDatabase();

    // Get the case
    const patient = await Patient.findById(params.id);
    if (!patient) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Get all notes for this case
    const notes = await Note.find({ patientId: params.id })
      .sort({ visitDate: 1 })
      .lean();

    // Limit the number of notes to prevent token overflow
    const recentNotes = notes.slice(-5); // Only use the 5 most recent notes

    // Generate summary using Mistral
    const summary = await generateCaseSummary(patient, recentNotes);

    // Update the case with the new summary and change status to closed
    patient.caseSummary = summary;
    patient.status = 'closed';
    await patient.save();

    return NextResponse.json({ message: 'Summary generated successfully' });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    
    // Handle specific Mistral errors
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Mistral API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid Mistral API key. Please check your configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 