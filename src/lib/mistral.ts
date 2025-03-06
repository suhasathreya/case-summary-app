import MistralClient from '@mistralai/mistralai';

const client = new MistralClient(process.env.MISTRAL_API_KEY || '');

export async function generateCaseSummary(patient: any, notes: any[]): Promise<string> {
  // Prepare the context for the LLM
  const patientInfo = `
Patient Information:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Reason for Admission: ${patient.reasonForAdmission}
- Status: ${patient.status}
${patient.dischargeDate ? `- Discharge Date: ${new Date(patient.dischargeDate).toLocaleDateString()}` : ''}`;

  const timeline = notes.map((note, index) => {
    const date = new Date(note.visitDate).toLocaleDateString();
    return `${date}: ${note.content}`;
  }).join('\n');

  const prompt = `You are a medical professional writing a case summary. Please analyze the following patient information and clinical notes to create a professional, well-structured case summary. The summary should:

1. Provide a clear narrative of the patient's journey
2. Highlight key clinical findings and interventions
3. Note any significant changes in condition
4. Include relevant dates and timelines
5. End with the current status and any important follow-up considerations

Patient Information:
${patientInfo}

Clinical Notes Timeline (Most Recent):
${timeline}

Please write a professional medical case summary that synthesizes this information into a coherent narrative.`;

  try {
    const chatResponse = await client.chat({
      model: "mistral-tiny",
      messages: [
        {
          role: "system",
          content: "You are a medical professional writing case summaries. Write in a clear, professional medical style, focusing on clinical relevance and patient outcomes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return chatResponse.choices[0].message.content || 'Failed to generate summary';
  } catch (error: any) {
    console.error('Error in Mistral API call:', error);
    throw error;
  }
} 