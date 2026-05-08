const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function diagnoseError(errorText) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }

  const systemPrompt = `You are a senior DevOps/SRE engineer assistant. The user will paste an error message, log output, or describe a problem they're facing.

Your job is to:
1. Identify what the error is about (Kubernetes, Docker, Terraform, AWS, CI/CD, Linux, networking, etc.)
2. Explain the root cause in simple terms
3. Provide step-by-step troubleshooting commands
4. Suggest the most likely fix

Format your response EXACTLY as JSON with this structure:
{
  "category": "Kubernetes|Docker|Terraform|AWS|CI/CD|Linux|Networking|Database|Other",
  "severity": "critical|high|medium|low",
  "title": "Short description of the error",
  "rootCause": "Explanation of what's causing this",
  "steps": [
    {"title": "Step description", "command": "command to run (or null if no command)"}
  ],
  "fix": "The most likely fix or solution",
  "tips": ["Additional tip 1", "Additional tip 2"]
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: errorText },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} — ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from Groq API')
  }

  try {
    // Try to parse JSON directly
    return JSON.parse(content)
  } catch {
    // If it has markdown code blocks, extract the JSON
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    // Last resort: try to find JSON object in the text
    const objectMatch = content.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }
    throw new Error('Could not parse AI response')
  }
}
