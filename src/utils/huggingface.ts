const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

export async function generateCaseSummary(text: string): Promise<string> {
  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 500,
          min_length: 100,
          do_sample: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0].summary_text : result.summary_text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate case summary");
  }
} 