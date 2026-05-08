// Mock data for demo purposes (when no Jira credentials are configured)
const mockTickets = {
  'DEVOPS-23372': {
    key: 'DEVOPS-23372',
    summary: 'Migrar sportsbook-ordering-engine a nuevo cluster EKS',
    status: 'In Progress',
    assignee: 'DevOps Engineer',
    priority: 'High',
    description: 'Migrar el servicio sportsbook-ordering-engine del cluster legacy al nuevo cluster EKS en us-east-1. Incluye actualización de Helm charts, configuración de HPA, Redis y validación de conectividad.',
    comments: [
      { author: 'DevOps Engineer', body: 'Ya tengo los helm values listos para dev y qa, falta configurar el ingress y validar Redis.', created: '2026-05-06' },
      { author: 'Tech Lead', body: 'Recuerda que el Redis necesita su propio namespace y los security groups deben permitir tráfico desde el nuevo cluster.', created: '2026-05-05' },
    ],
    subtasks: [
      { key: 'DEVOPS-23373', summary: 'Crear namespace y kustomization base', status: 'Done' },
      { key: 'DEVOPS-23374', summary: 'Configurar Helm values (dev/qa)', status: 'Done' },
      { key: 'DEVOPS-23375', summary: 'Setup Redis en nuevo cluster', status: 'In Progress' },
      { key: 'DEVOPS-23376', summary: 'Configurar Ingress + TLS', status: 'To Do' },
      { key: 'DEVOPS-23377', summary: 'Validar en QA', status: 'To Do' },
    ],
  },
  'DI-290': {
    key: 'DI-290',
    summary: 'Configurar pipeline CI/CD para microservicio de integración',
    status: 'In Progress',
    assignee: 'DevOps Engineer',
    priority: 'Medium',
    description: 'Crear pipeline completo de CI/CD para el microservicio de integración. Incluye build, test, scan de vulnerabilidades y deploy a dev/qa/prod con ArgoCD.',
    comments: [
      { author: 'DevOps Engineer', body: 'Pipeline de build y test listo. Falta integrar el deploy con ArgoCD y configurar los environments.', created: '2026-05-06' },
      { author: 'Scrum Master', body: 'Necesitamos esto para el sprint review del viernes.', created: '2026-05-05' },
    ],
    subtasks: [
      { key: 'DI-291', summary: 'Dockerfile + build stage', status: 'Done' },
      { key: 'DI-292', summary: 'Unit tests + lint stage', status: 'Done' },
      { key: 'DI-293', summary: 'Integrar ArgoCD sync', status: 'In Progress' },
      { key: 'DI-294', summary: 'Configurar environments (dev/qa/prod)', status: 'To Do' },
    ],
  },
  'DEVOPS-23400': {
    key: 'DEVOPS-23400',
    summary: 'Fix OOMKilled en servicio de notificaciones',
    status: 'In Progress',
    assignee: 'DevOps Engineer',
    priority: 'Critical',
    description: 'El pod notification-service está siendo killed por OOM en producción. Necesita ajuste de memory limits y posible memory leak investigation.',
    comments: [
      { author: 'DevOps Engineer', body: 'Identifiqué que el memory leak viene del connection pool de Redis que no se cierra correctamente.', created: '2026-05-06' },
      { author: 'Backend Dev', body: 'En staging no se reproduce porque tiene menos tráfico. Necesitamos load test.', created: '2026-05-05' },
    ],
    subtasks: [
      { key: 'DEVOPS-23401', summary: 'Analizar heap dumps', status: 'Done' },
      { key: 'DEVOPS-23402', summary: 'Fix connection pool leak', status: 'In Progress' },
      { key: 'DEVOPS-23403', summary: 'Ajustar memory limits en Helm values', status: 'To Do' },
      { key: 'DEVOPS-23404', summary: 'Load test en staging', status: 'To Do' },
    ],
  },
}

/**
 * Extract ticket key from a Jira URL or plain text
 * Supports:
 *   - https://company.atlassian.net/browse/DEVOPS-123
 *   - https://company.atlassian.net/jira/software/projects/DEVOPS/boards/1?selectedIssue=DEVOPS-123
 *   - DEVOPS-123
 *   - devops-123 (case insensitive)
 */
export function extractTicketKey(input) {
  if (!input.trim()) return null

  // Try to match ticket key pattern (case insensitive)
  const match = input.match(/([a-zA-Z][a-zA-Z0-9]+-\d+)/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * Get Jira credentials from localStorage
 */
export function getJiraConfig() {
  const config = localStorage.getItem('jira_config')
  return config ? JSON.parse(config) : null
}

/**
 * Save Jira credentials to localStorage
 */
export function saveJiraConfig(config) {
  localStorage.setItem('jira_config', JSON.stringify(config))
}

/**
 * Clear Jira credentials
 */
export function clearJiraConfig() {
  localStorage.removeItem('jira_config')
}

/**
 * Fetch ticket from Jira API (real)
 */
async function fetchFromJiraAPI(ticketKey, config) {
  const { domain, email, apiToken } = config
  const url = `https://${domain}/rest/api/3/issue/${ticketKey}?expand=comments`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${btoa(`${email}:${apiToken}`)}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    key: data.key,
    summary: data.fields.summary,
    status: data.fields.status?.name || 'Unknown',
    assignee: data.fields.assignee?.displayName || 'Unassigned',
    priority: data.fields.priority?.name || 'None',
    description: data.fields.description?.content?.[0]?.content?.[0]?.text || data.fields.description || '',
    comments: (data.fields.comment?.comments || []).slice(-3).map(c => ({
      author: c.author?.displayName || 'Unknown',
      body: c.body?.content?.[0]?.content?.[0]?.text || '',
      created: c.created?.split('T')[0] || '',
    })),
    subtasks: (data.fields.subtasks || []).map(st => ({
      key: st.key,
      summary: st.fields.summary,
      status: st.fields.status?.name || 'Unknown',
    })),
  }
}

/**
 * Fetch ticket - uses real API if configured, otherwise mock data
 */
export async function fetchTicket(input) {
  const ticketKey = extractTicketKey(input)
  if (!ticketKey) {
    throw new Error('No se pudo extraer el ID del ticket. Usa formato PROJ-123 o pega el link completo.')
  }

  const config = getJiraConfig()

  if (config && config.domain && config.email && config.apiToken) {
    // Real Jira API
    try {
      return await fetchFromJiraAPI(ticketKey, config)
    } catch (error) {
      throw new Error(`Error conectando a Jira: ${error.message}`)
    }
  }

  // Mock mode - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const mockTicket = mockTickets[ticketKey]
  if (mockTicket) {
    return mockTicket
  }

  // Generate a generic mock for any ticket ID
  return {
    key: ticketKey,
    summary: `Ticket ${ticketKey} - Tarea de ejemplo`,
    status: 'In Progress',
    assignee: 'Tu Nombre',
    priority: 'Medium',
    description: `Esta es una descripción mock para ${ticketKey}. Configura tus credenciales de Jira para obtener datos reales.`,
    comments: [],
    subtasks: [],
  }
}

/**
 * Parse raw pasted ticket content into structured data
 * Handles various formats from copy-pasting Jira tickets
 */
export function parseRawTicket(rawText) {
  const lines = rawText.trim().split('\n').map(l => l.trim()).filter(Boolean)
  
  if (lines.length === 0) {
    throw new Error('No se detectó contenido. Pega la info de tu ticket.')
  }

  const result = {
    key: '',
    summary: '',
    status: '',
    priority: '',
    description: '',
    subtasks: [],
  }

  // Try to find ticket key (PROJ-123 pattern)
  for (const line of lines) {
    const keyMatch = line.match(/([A-Z][A-Z0-9]+-\d+)/i)
    if (keyMatch && !result.key) {
      result.key = keyMatch[1].toUpperCase()
      // If the line has more text after the key, it might be "KEY - Title" or "KEY: Title"
      const afterKey = line.replace(keyMatch[0], '').replace(/^[\s\-:]+/, '').trim()
      if (afterKey && !result.summary) {
        result.summary = afterKey
      }
      continue
    }
  }

  // Try to find status
  for (const line of lines) {
    const statusMatch = line.match(/(?:status|estado)\s*[:=]\s*(.+)/i)
    if (statusMatch) {
      result.status = statusMatch[1].trim()
      continue
    }
    // Common Jira statuses as standalone
    if (/^(In Progress|To Do|Done|In Review|QA|Blocked|Open|Closed|Resolved)$/i.test(line)) {
      if (!result.status) result.status = line
    }
  }

  // Try to find priority
  for (const line of lines) {
    const priorityMatch = line.match(/(?:priority|prioridad)\s*[:=]\s*(.+)/i)
    if (priorityMatch) {
      result.priority = priorityMatch[1].trim()
    }
  }

  // First non-key, non-metadata line is likely the title/summary
  if (!result.summary) {
    for (const line of lines) {
      if (line.match(/([A-Z][A-Z0-9]+-\d+)/i)) continue
      if (line.match(/(?:status|estado|priority|prioridad|descripción|description|subtask)\s*[:=]/i)) continue
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('[')) continue
      result.summary = line
      break
    }
  }

  // Try to find subtasks (lines starting with -, •, *, or containing [STATUS])
  const subtaskPatterns = [
    /^[-•*]\s*\[?(DONE|HECHO|COMPLETADO|✅)\]?\s*(.+)/i,
    /^[-•*]\s*\[?(IN PROGRESS|EN PROGRESO|🔄)\]?\s*(.+)/i,
    /^[-•*]\s*\[?(TO DO|PENDIENTE|POR HACER|📋)\]?\s*(.+)/i,
    /^[-•*]\s*(.+)/,
  ]

  for (const line of lines) {
    let matched = false
    
    // Check for status-tagged subtasks
    const doneMatch = line.match(/^[-•*]\s*\[?(DONE|HECHO|COMPLETADO|✅)\]?\s*[-:]?\s*(.+)/i)
    if (doneMatch) {
      result.subtasks.push({ summary: doneMatch[2].trim(), status: 'Done' })
      matched = true
    }
    
    const progressMatch = line.match(/^[-•*]\s*\[?(IN PROGRESS|EN PROGRESO|🔄)\]?\s*[-:]?\s*(.+)/i)
    if (!matched && progressMatch) {
      result.subtasks.push({ summary: progressMatch[2].trim(), status: 'In Progress' })
      matched = true
    }
    
    const todoMatch = line.match(/^[-•*]\s*\[?(TO DO|PENDIENTE|POR HACER|📋)\]?\s*[-:]?\s*(.+)/i)
    if (!matched && todoMatch) {
      result.subtasks.push({ summary: todoMatch[2].trim(), status: 'To Do' })
      matched = true
    }
  }

  // Collect remaining text as description
  const usedLines = new Set()
  if (result.key) usedLines.add(result.key)
  if (result.summary) usedLines.add(result.summary)
  
  const descLines = lines.filter(line => {
    if (line.match(/([A-Z][A-Z0-9]+-\d+)/i) && !line.includes(' ')) return false
    if (line === result.summary) return false
    if (line.match(/(?:status|estado|priority|prioridad)\s*[:=]/i)) return false
    if (line.match(/^[-•*]\s*\[/)) return false
    if (line.match(/^(subtask|descripción|description)/i)) return false
    return true
  })
  result.description = descLines.join(' ').substring(0, 500)

  // Default key if not found
  if (!result.key) result.key = 'TICKET'
  if (!result.summary) result.summary = lines[0] || 'Sin título'

  return result
}

/**
 * Generate speech from parsed paste data + user context
 */
export function generateSpeechFromParsed(parsed, whatDid, whatNext, blockers) {
  const completedTasks = parsed.subtasks.filter(st => st.status === 'Done')
  const inProgressTasks = parsed.subtasks.filter(st => st.status === 'In Progress')
  const todoTasks = parsed.subtasks.filter(st => st.status === 'To Do')

  // Build "what did" from user input or subtasks
  let didText = whatDid
  if (!didText && completedTasks.length > 0) {
    didText = completedTasks.map(t => t.summary).join(', ')
  }
  if (!didText && inProgressTasks.length > 0) {
    didText = `Made progress on: ${inProgressTasks.map(t => t.summary).join(', ')}`
  }
  if (!didText) didText = 'Worked on the main task'

  // Build "what next" from user input or subtasks
  let nextText = whatNext
  if (!nextText && inProgressTasks.length > 0) {
    nextText = inProgressTasks.map(t => t.summary).join(', ')
  }
  if (!nextText && todoTasks.length > 0) {
    nextText = todoTasks.map(t => t.summary).join(', ')
  }
  if (!nextText) nextText = 'Continue with the ticket'

  // Blockers
  const blockText = blockers && blockers.toLowerCase() !== 'ninguno' && blockers.toLowerCase() !== 'no'
    ? blockers
    : null

  // Build speech in English
  const speech = `Yesterday I was working on ${parsed.key} — ${parsed.summary}.

What I did: ${didText}.

Today I'll continue with: ${nextText}.

${blockText ? `⚠️ Blocker: ${blockText}.` : 'No blockers.'}`

  return {
    ticketId: parsed.key,
    summary: parsed.summary,
    status: parsed.status || null,
    priority: parsed.priority || null,
    whatDid: didText,
    whatRemains: nextText,
    blockers: blockText || 'No blockers',
    speechText: speech,
    subtasks: parsed.subtasks,
  }
}

/**
 * Generate speech from ticket data (API mode)
 */
export function generateSpeechFromTicket(ticket) {
  const completedTasks = ticket.subtasks.filter(st => st.status === 'Done')
  const inProgressTasks = ticket.subtasks.filter(st => st.status === 'In Progress')
  const todoTasks = ticket.subtasks.filter(st => st.status === 'To Do')

  // What was done (from completed subtasks and latest comment)
  let whatDid = ''
  if (completedTasks.length > 0) {
    whatDid = completedTasks.map(t => t.summary).join(', ')
  }
  if (ticket.comments.length > 0) {
    const latestComment = ticket.comments[ticket.comments.length - 1]
    whatDid += whatDid ? `. Último update: ${latestComment.body}` : latestComment.body
  }

  // What remains
  let whatRemains = ''
  if (inProgressTasks.length > 0) {
    whatRemains = `En progreso: ${inProgressTasks.map(t => t.summary).join(', ')}`
  }
  if (todoTasks.length > 0) {
    whatRemains += whatRemains ? `. Pendiente: ${todoTasks.map(t => t.summary).join(', ')}` : todoTasks.map(t => t.summary).join(', ')
  }

  // Detect blockers from comments
  let blockers = 'No blockers'
  const blockerKeywords = ['blocker', 'blocked', 'waiting', 'necesita', 'depende', 'no puedo', 'can\'t', 'unable']
  for (const comment of ticket.comments) {
    if (blockerKeywords.some(kw => comment.body.toLowerCase().includes(kw))) {
      blockers = comment.body
      break
    }
  }

  // Build speech in English
  const speech = `Yesterday I was working on ${ticket.key} — ${ticket.summary}.

What I did: ${whatDid || 'Worked on the main task'}.

Today I'll continue with: ${whatRemains || 'Complete pending subtasks'}.

${blockers !== 'No blockers' ? `⚠️ Blocker: ${blockers}` : 'No blockers.'}`

  return {
    ticketId: ticket.key,
    summary: ticket.summary,
    status: ticket.status,
    priority: ticket.priority,
    whatDid: whatDid || 'Worked on the main task',
    whatRemains: whatRemains || 'Complete pending subtasks',
    blockers,
    speechText: speech,
    subtasks: ticket.subtasks,
  }
}
