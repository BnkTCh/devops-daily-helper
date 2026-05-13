/**
 * Groq AI Service — Servicio centralizado de IA para toda la app
 * Usa la API de Groq (compatible con OpenAI) con el modelo Llama 3.3 70B
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Llamada base a Groq API
 */
async function callGroq({ systemPrompt, userPrompt, temperature = 0.3, maxTokens = 1500 }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key no configurado. Agrega VITE_GROQ_API_KEY en tu archivo .env')
  }

  const messages = []
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: userPrompt })

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Groq API error: ${response.status} — ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No se recibió respuesta de Groq')
  }

  return content.trim()
}

/**
 * Parsear JSON de la respuesta de la IA (maneja markdown code blocks)
 */
function parseJSON(content) {
  try {
    return JSON.parse(content)
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    const objectMatch = content.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }
    throw new Error('No se pudo parsear la respuesta de la IA')
  }
}

// ============================================================
// MÓDULO: TROUBLESHOOTING
// ============================================================

export async function diagnoseError(errorText) {
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

  const content = await callGroq({
    systemPrompt,
    userPrompt: errorText,
    temperature: 0.3,
    maxTokens: 1500,
  })

  return parseJSON(content)
}

// ============================================================
// MÓDULO: YAML GENERATOR
// ============================================================

export async function generateYamlWithAI(prompt) {
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

  const content = await callGroq({
    systemPrompt,
    userPrompt: prompt,
    temperature: 0.2,
    maxTokens: 2000,
  })

  // Clean up markdown code blocks if the model adds them
  let yaml = content
  if (yaml.startsWith('```')) {
    yaml = yaml.replace(/^```(?:yaml|yml)?\n?/, '').replace(/\n?```$/, '')
  }

  return yaml.trim()
}

// ============================================================
// MÓDULO: DAILY SPEECH
// ============================================================

export async function enhanceSpeechWithAI(tickets, blockers) {
  const ticketSummary = tickets.map(t => {
    let info = `- ${t.ticketId}: "${t.title}" (status: ${t.status})`
    if (t.whatDid) info += `\n  What was done: ${t.whatDid}`
    if (t.whatNext) info += `\n  What's next: ${t.whatNext}`
    return info
  }).join('\n')

  const blockerText = blockers && blockers.toLowerCase() !== 'none' && blockers.toLowerCase() !== 'no'
    ? `Blockers: ${blockers}`
    : 'No blockers'

  const userPrompt = `You are helping a DevOps engineer prepare their daily standup speech. Based on the following ticket information, generate a natural, conversational speech that they can say out loud in their daily meeting.

TICKETS:
${ticketSummary}

${blockerText}

RULES:
- Write in ENGLISH
- Keep it concise (30-60 seconds when spoken)
- Sound natural and conversational, like a real person talking in a standup
- Don't be robotic or overly formal
- Include ticket IDs naturally in the flow
- Structure: what you did yesterday → what you'll do today → blockers
- Don't use bullet points — write it as flowing speech
- Don't start with "Hey team" or greetings — go straight to the update
- If there are blockers, mention them clearly at the end

Return ONLY the speech text, nothing else.`

  return await callGroq({
    userPrompt,
    temperature: 0.7,
    maxTokens: 500,
  })
}
