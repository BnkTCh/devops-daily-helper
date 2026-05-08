const JIRA_DOMAIN = import.meta.env.VITE_JIRA_DOMAIN
const JIRA_EMAIL = import.meta.env.VITE_JIRA_EMAIL
const JIRA_TOKEN = import.meta.env.VITE_JIRA_TOKEN

export function isJiraConfigured() {
  return !!(JIRA_DOMAIN && JIRA_EMAIL && JIRA_TOKEN)
}

/**
 * Extract ticket key from URL or plain text
 * Supports:
 *   - https://foshtech.atlassian.net/browse/DI-290
 *   - https://jira.itspty.com/browse/DEVOPS-23372
 *   - DI-290
 *   - devops-23372
 */
export function extractTicketKey(input) {
  if (!input.trim()) return null
  const match = input.match(/([a-zA-Z][a-zA-Z0-9]+-\d+)/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * Fetch ticket data from Jira Cloud API
 */
export async function fetchJiraTicket(input) {
  const ticketKey = extractTicketKey(input)
  if (!ticketKey) {
    throw new Error('No se pudo extraer el ID del ticket. Usa formato PROJ-123 o pega el link.')
  }

  if (!isJiraConfigured()) {
    throw new Error('Jira no está configurado. Agrega VITE_JIRA_DOMAIN, VITE_JIRA_EMAIL y VITE_JIRA_TOKEN en el archivo .env')
  }

  const url = `/jira-api/rest/api/3/issue/${ticketKey}?fields=summary,status,priority,assignee,subtasks,comment,description`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`)}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Error de autenticación. Verifica tu email y token de Jira.')
    }
    if (response.status === 404) {
      throw new Error(`Ticket ${ticketKey} no encontrado.`)
    }
    throw new Error(`Error de Jira API: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // Parse subtasks
  const subtasks = (data.fields.subtasks || []).map(st => ({
    key: st.key,
    summary: st.fields.summary,
    status: st.fields.status?.name || 'Unknown',
  }))

  // Parse latest comments
  const comments = (data.fields.comment?.comments || []).slice(-5).map(c => ({
    author: c.author?.displayName || 'Unknown',
    body: extractTextFromADF(c.body),
    created: c.created?.split('T')[0] || '',
  }))

  // Parse description
  const description = extractTextFromADF(data.fields.description)

  return {
    key: data.key,
    summary: data.fields.summary,
    status: data.fields.status?.name || 'Unknown',
    priority: data.fields.priority?.name || 'None',
    assignee: data.fields.assignee?.displayName || 'Unassigned',
    description,
    subtasks,
    comments,
  }
}

/**
 * Extract plain text from Atlassian Document Format (ADF)
 */
function extractTextFromADF(adf) {
  if (!adf) return ''
  if (typeof adf === 'string') return adf

  let text = ''
  function walk(node) {
    if (node.type === 'text') {
      text += node.text || ''
    }
    if (node.content) {
      node.content.forEach(walk)
    }
  }
  walk(adf)
  return text.trim()
}
