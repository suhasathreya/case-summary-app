import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCaseSummary(patientInfo: any, interactions: any[]) {
  const prompt = `Generate a detailed medical case summary for the following patient and their interactions:

Patient Information:
${JSON.stringify(patientInfo, null, 2)}

Medical Interactions:
${JSON.stringify(interactions, null, 2)}

Please provide a comprehensive case summary that includes:
1. Patient demographics and background
2. Chronological summary of all medical interactions
3. Key findings and diagnoses
4. Treatment plans and medications
5. Test results and their interpretations
6. Overall patient progress
7. Current status and recommendations

Format the summary in a professional medical report style.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical professional tasked with creating comprehensive case summaries. Use professional medical terminology while maintaining clarity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating case summary:', error);
    throw new Error('Failed to generate case summary');
  }
}

export default openai; 