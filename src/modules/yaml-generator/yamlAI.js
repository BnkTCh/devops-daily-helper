const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function generateYamlWithAI(prompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }

  const systemPrompt = `You are a Kubernetes YAML generator. The user will describe what they need in plain English, and you generate the corresponding Kubernetes manifest(s).

RULES:
- Generate valid, production-ready Kubernetes YAML
- Include best practices: resource limits/requests, labels, proper API versions
- Use the latest stable API versions (apps/v1, networking.k8s.io/v1, etc.)
- Add helpful comments in the YAML where appropriate
- If the user doesn't specify a namespace, use "default"
- If the user doesn't specify resource limits, add sensible defaults
- If multiple resources are needed (e.g. Deployment + Service), separate them with "---"
- Return ONLY the YAML content, no markdown code blocks, no explanations before or after
- Do NOT wrap the output in \`\`\`yaml or \`\`\` — just raw YAML`

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
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} — ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from AI')
  }

  // Clean up any markdown code blocks if the model adds them anyway
  let yaml = content.trim()
  if (yaml.startsWith('```')) {
    yaml = yaml.replace(/^```(?:yaml|yml)?\n?/, '').replace(/\n?```$/, '')
  }

  return yaml.trim()
}
