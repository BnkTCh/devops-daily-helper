const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function enhanceSpeechWithAI(tickets, blockers) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }

  const ticketSummary = tickets.map(t => {
    let info = `- ${t.ticketId}: "${t.title}" (status: ${t.status})`
    if (t.whatDid) info += `\n  What was done: ${t.whatDid}`
    if (t.whatNext) info += `\n  What's next: ${t.whatNext}`
    return info
  }).join('\n')

  const blockerText = blockers && blockers.toLowerCase() !== 'none' && blockers.toLowerCase() !== 'no'
    ? `Blockers: ${blockers}`
    : 'No blockers'

  const prompt = `You are helping a DevOps engineer prepare their daily standup speech. Based on the following ticket information, generate a natural, conversational speech that they can say out loud in their daily meeting.

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

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
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

  return content.trim()
}

/**
 * Generate speech directly from Jira ticket data (description + comments + subtasks)
 */
export async function generateSpeechFromJiraData(ticket) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key not configured.')
  }

  // Build context from all ticket data
  let context = `TICKET: ${ticket.key} — ${ticket.summary}
Status: ${ticket.status}
Priority: ${ticket.priority}
Assignee: ${ticket.assignee}`

  if (ticket.description) {
    context += `\n\nDESCRIPTION:\n${ticket.description}`
  }

  if (ticket.subtasks && ticket.subtasks.length > 0) {
    context += `\n\nSUBTASKS:`
    ticket.subtasks.forEach(st => {
      context += `\n- [${st.status}] ${st.summary}`
    })
  }

  if (ticket.comments && ticket.comments.length > 0) {
    context += `\n\nLATEST COMMENTS:`
    ticket.comments.forEach(c => {
      context += `\n- ${c.author} (${c.created}): ${c.body}`
    })
  }

  const prompt = `You are helping a DevOps engineer prepare their daily standup speech. Based on the following Jira ticket data, analyze what has been done, what's in progress, and what's pending. Then generate a natural daily standup speech.

${context}

RULES:
- Write the speech in ENGLISH
- Analyze the subtasks statuses, comments, and description to understand progress
- From "Done" subtasks and recent comments, infer what was done yesterday
- From "In Progress" subtasks, infer what will be worked on today
- From comments, detect any blockers or dependencies
- Keep it concise (30-60 seconds when spoken)
- Sound natural and conversational
- Include the ticket ID naturally
- Structure: what you did yesterday → what you'll do today → blockers
- Don't use bullet points — write it as flowing speech
- Don't start with greetings — go straight to the update

Return ONLY the speech text, nothing else.`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
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

  return content.trim()
}
