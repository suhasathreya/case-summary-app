import { NextResponse } from 'next/server'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const result = await response.json()
        if (!result || !result[0] || (!result[0].generated_text && !result[0].summary_text)) {
          throw new Error('Invalid response format from API')
        }
        return result
      }
      
      const errorText = await response.text()
      if (errorText.includes("Model is currently loading")) {
        console.log('Model is loading, retrying in 5 seconds...')
        await delay(5000)
        continue
      }
      
      throw new Error(`API responded with status ${response.status}: ${errorText}`)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.log(`Attempt ${i + 1} failed, retrying in 3 seconds...`)
      await delay(3000)
    }
  }
  throw new Error('Max retries reached')
}

export async function POST(req: Request) {
  try {
    const { notes } = await req.json()
    
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('HUGGINGFACE_API_KEY is not set')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Format notes into a clear, factual narrative
    const narrative = notes.map((note: string, index: number) => {
      return `Visit ${index + 1}: ${note.trim()}`
    }).join('\n\n')

    const prompt = `summarize: ${narrative}`

    console.log('Making request to Hugging Face API...')
    
    const result = await fetchWithRetry(
      'https://api-inference.huggingface.co/models/t5-small',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            min_length: 30,
            temperature: 0.3,
            do_sample: false
          },
        }),
      }
    )

    console.log('API Response:', result)

    // Extract the generated text
    const generatedText = result[0].generated_text || result[0].summary_text
    if (!generatedText) {
      throw new Error('No summary text in response')
    }

    // Clean up and format the summary
    const summary = generatedText
      .replace(/^summarize:\s*/i, '')
      .replace(/visit \d+:/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Add proper formatting
    const formattedSummary = `Medical Case Summary\n\n${summary}`

    return NextResponse.json({ summary: formattedSummary })
  } catch (error) {
    console.error('Error in generate-summary:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate summary',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 