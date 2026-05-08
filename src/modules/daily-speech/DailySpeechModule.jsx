import { useState } from 'react'
import { FiCopy, FiCheck, FiMic, FiRefreshCw, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiZap, FiLoader, FiDownloadCloud } from 'react-icons/fi'
import { enhanceSpeechWithAI, generateSpeechFromJiraData } from './speechAI'
import { isJiraConfigured, fetchJiraTicket, extractTicketKey } from './jiraApi'

const emptyTicket = {
  id: Date.now(),
  ticketId: '',
  title: '',
  status: 'In Progress',
  whatDid: '',
  whatNext: '',
}

function DailySpeechModule() {
  const [tickets, setTickets] = useState([{ ...emptyTicket }])
  const [blockers, setBlockers] = useState('')
  const [generatedSpeech, setGeneratedSpeech] = useState(null)
  const [aiSpeech, setAiSpeech] = useState(null)
  const [copied, setCopied] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  // Jira import
  const [jiraInput, setJiraInput] = useState('')
  const [jiraLoading, setJiraLoading] = useState(false)
  const [jiraError, setJiraError] = useState(null)

  const jiraEnabled = isJiraConfigured()

  const addTicket = () => {
    setTickets(prev => [...prev, { ...emptyTicket, id: Date.now() }])
    setExpandedTicket(tickets.length)
  }

  const removeTicket = (index) => {
    if (tickets.length === 1) return
    setTickets(prev => prev.filter((_, i) => i !== index))
    if (expandedTicket >= tickets.length - 1) {
      setExpandedTicket(Math.max(0, tickets.length - 2))
    }
  }

  const updateTicket = (index, field, value) => {
    setTickets(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const toggleExpand = (index) => {
    setExpandedTicket(expandedTicket === index ? -1 : index)
  }

  const importFromJira = async () => {
    if (!jiraInput.trim()) return
    setJiraLoading(true)
    setJiraError(null)

    try {
      const ticket = await fetchJiraTicket(jiraInput)

      // Auto-fill "what did" from Done subtasks + latest comment
      const doneTasks = ticket.subtasks.filter(st => st.status === 'Done' || st.status === 'Closed')
      const inProgressTasks = ticket.subtasks.filter(st => st.status === 'In Progress')
      const todoTasks = ticket.subtasks.filter(st => st.status !== 'Done' && st.status !== 'Closed' && st.status !== 'In Progress')

      let whatDid = ''
      if (ticket.status !== 'To Do') {
        if (doneTasks.length > 0) {
          whatDid = doneTasks.map(st => st.summary).join(', ')
        }
        // Add context from latest comment if available
        if (ticket.comments.length > 0) {
          const latestComment = ticket.comments[ticket.comments.length - 1].body
          if (latestComment && !whatDid) {
            whatDid = latestComment.substring(0, 150)
          }
        }
        if (!whatDid) {
          whatDid = `Worked on: ${ticket.summary}`
        }
      }

      // Auto-fill "what next" from In Progress or To Do subtasks
      let whatNext = ''
      if (inProgressTasks.length > 0) {
        whatNext = inProgressTasks.map(st => st.summary).join(', ')
      } else if (todoTasks.length > 0) {
        whatNext = todoTasks.slice(0, 2).map(st => st.summary).join(', ')
      } else {
        whatNext = 'Continue with the ticket'
      }

      const newTicket = {
        id: Date.now(),
        ticketId: ticket.key,
        title: ticket.summary,
        status: ticket.status,
        whatDid,
        whatNext,
        _jiraData: ticket,
      }

      // Auto-fill blockers if ticket status indicates blocked
      const isBlocked = ticket.status.toLowerCase().includes('block') || 
                        ticket.status.toLowerCase().includes('impediment') ||
                        ticket.status.toLowerCase().includes('waiting')
      if (isBlocked) {
        let blockerReason = ''
        if (ticket.comments.length > 0) {
          blockerReason = `${ticket.key}: ${ticket.comments[ticket.comments.length - 1].body}`
        } else {
          blockerReason = `${ticket.key}: ${ticket.summary}`
        }
        setBlockers(current => current ? `${current}, ${blockerReason}` : blockerReason)
      }

      // Add or replace first empty ticket
      const firstEmptyIdx = tickets.findIndex(t => !t.ticketId && !t.title)
      if (firstEmptyIdx >= 0) {
        setTickets(prev => prev.map((t, i) => i === firstEmptyIdx ? newTicket : t))
        setExpandedTicket(firstEmptyIdx)
      } else {
        setTickets(prev => [...prev, newTicket])
        setExpandedTicket(tickets.length)
      }

      setJiraInput('')
    } catch (err) {
      setJiraError(err.message)
    } finally {
      setJiraLoading(false)
    }
  }

  const canGenerate = tickets.some(t => t.ticketId && t.title)

  const generateSpeech = () => {
    const validTickets = tickets.filter(t => t.ticketId && t.title)
    if (validTickets.length === 0) return

    const doneItems = []
    const nextItems = []

    validTickets.forEach(t => {
      if (t.status === 'To Do') {
        // To Do tickets only go in "today" section
        nextItems.push(`${t.ticketId}: ${t.whatNext || t.title}`)
      } else if (t.status === 'Done') {
        // Done tickets only go in "yesterday" section
        doneItems.push(`${t.ticketId}: ${t.whatDid || t.title}`)
      } else {
        // In Progress, In Review, Blocked — show in both
        if (t.whatDid) {
          doneItems.push(`${t.ticketId}: ${t.whatDid}`)
        } else {
          doneItems.push(`${t.ticketId} — ${t.title}`)
        }
        if (t.whatNext) {
          nextItems.push(`${t.ticketId}: ${t.whatNext}`)
        } else {
          nextItems.push(`${t.ticketId}: Continue working on it`)
        }
      }
    })

    const hasBlocker = blockers.trim() &&
      blockers.toLowerCase() !== 'none' &&
      blockers.toLowerCase() !== 'no' &&
      blockers.toLowerCase() !== 'ninguno'

    let speech = ''

    if (doneItems.length > 0) {
      speech += `Yesterday I worked on:\n`
      doneItems.forEach(item => { speech += `• ${item}\n` })
      speech += `\n`
    }

    if (nextItems.length > 0) {
      speech += `Today I'll ${doneItems.length > 0 ? 'continue' : 'start'} with:\n`
      nextItems.forEach(item => { speech += `• ${item}\n` })
    }

    if (hasBlocker) {
      speech += `\n⚠️ Blocker: ${blockers.trim()}`
    } else {
      speech += `\nNo blockers.`
    }

    setGeneratedSpeech({
      tickets: validTickets,
      speechText: speech.trim(),
      blockers: hasBlocker ? blockers.trim() : 'No blockers',
    })
    setAiSpeech(null)
    setAiError(null)
  }

  const handleAIEnhance = async () => {
    const validTickets = tickets.filter(t => t.ticketId && t.title)
    if (validTickets.length === 0) return
    setAiLoading(true)
    setAiError(null)

    // If we have Jira data, use it for richer AI generation
    const ticketsWithJiraData = validTickets.filter(t => t._jiraData)
    if (ticketsWithJiraData.length > 0) {
      try {
        // Use the first ticket with Jira data for now (could combine multiple)
        const enhanced = await generateSpeechFromJiraData(ticketsWithJiraData[0]._jiraData)
        setAiSpeech(enhanced)
        setAiLoading(false)
        return
      } catch {
        // Fall through to basic enhancement
      }
    }

    // Fallback: basic enhancement from form data
    try {
      const enhanced = await enhanceSpeechWithAI(validTickets, blockers)
      setAiSpeech(enhanced)
    } catch (err) {
      setAiError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const copySpeech = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setTickets([{ ...emptyTicket, id: Date.now() }])
    setBlockers('')
    setGeneratedSpeech(null)
    setAiSpeech(null)
    setAiError(null)
    setExpandedTicket(0)
  }

  const statusOptions = ['In Progress', 'To Do', 'In Review', 'Blocked', 'Done']

  const statusColors = {
    'Done': 'text-green-400 bg-green-900/30 border-green-800',
    'In Progress': 'text-blue-400 bg-blue-900/30 border-blue-800',
    'To Do': 'text-gray-400 bg-gray-900/30 border-gray-700',
    'In Review': 'text-purple-400 bg-purple-900/30 border-purple-800',
    'Blocked': 'text-red-400 bg-red-900/30 border-red-800',
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">🎤 Daily Speech</h1>
      <p className="text-gray-400 mb-6">
        Agrega tus tickets, genera el speech estructurado y usa IA para que suene natural. El speech se genera en inglés.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ticket inputs */}
        <div className="space-y-3">

          {/* Jira import */}
          {jiraEnabled && (
            <div className="card border-blue-500/30">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <FiDownloadCloud className="text-blue-400" />
                Importar desde Jira
              </h3>
              <div className="flex gap-2">
                <input
                  className="input-field text-sm flex-1"
                  placeholder="Pega el link o ID del ticket (ej: DI-290)"
                  value={jiraInput}
                  onChange={e => setJiraInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && importFromJira()}
                />
                <button
                  onClick={importFromJira}
                  disabled={jiraLoading || !jiraInput.trim()}
                  className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  {jiraLoading ? <FiLoader className="animate-spin" /> : <FiDownloadCloud />}
                  {jiraLoading ? '...' : 'Importar'}
                </button>
              </div>
              {jiraError && (
                <p className="text-xs text-red-400 mt-2">{jiraError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Trae automáticamente título, status y subtareas del ticket.
              </p>
            </div>
          )}

          {!jiraEnabled && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-xs text-gray-500">
              💡 Configura <code className="text-blue-400">VITE_JIRA_*</code> en tu archivo <code>.env</code> para importar tickets directo desde Jira.
            </div>
          )}

          {/* Tickets */}
          {tickets.map((ticket, index) => (
            <div key={ticket.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">#{index + 1}</span>
                  <span className="text-sm font-medium text-white">
                    {ticket.ticketId || 'Nuevo ticket'}
                  </span>
                  {ticket.ticketId && ticket.status && (
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[ticket.status] || 'text-gray-400 bg-gray-900/30'}`}>
                      {ticket.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {tickets.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTicket(index); }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  )}
                  {expandedTicket === index ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                </div>
              </div>

              {expandedTicket === index && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Ticket ID</label>
                      <input
                        className="input-field text-sm"
                        placeholder="DEVOPS-23372"
                        value={ticket.ticketId}
                        onChange={e => updateTicket(index, 'ticketId', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Status</label>
                      <div className="flex flex-wrap gap-1">
                        {statusOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => updateTicket(index, 'status', opt)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              ticket.status === opt
                                ? statusColors[opt] || 'bg-slate-600 text-white'
                                : 'bg-slate-800 text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Título</label>
                    <input
                      className="input-field text-sm"
                      placeholder="Pega el título del ticket aquí"
                      value={ticket.title}
                      onChange={e => updateTicket(index, 'title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">¿Qué hiciste en esto? (ayer)</label>
                    <input
                      className="input-field text-sm"
                      placeholder="ej: Configuré los helm values, creé el namespace"
                      value={ticket.whatDid}
                      onChange={e => updateTicket(index, 'whatDid', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">¿Qué sigue? (hoy)</label>
                    <input
                      className="input-field text-sm"
                      placeholder="ej: Validar en QA, hacer merge del PR"
                      value={ticket.whatNext}
                      onChange={e => updateTicket(index, 'whatNext', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addTicket}
            className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-gray-400 hover:text-white hover:border-accent transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <FiPlus />
            Agregar otro ticket
          </button>

          <div className="card">
            <label className="text-xs text-gray-500 mb-1 block">🚧 Bloqueos (global)</label>
            <input
              className="input-field text-sm"
              placeholder="¿Algún bloqueo? Deja vacío si no hay"
              value={blockers}
              onChange={e => setBlockers(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateSpeech}
              disabled={!canGenerate}
              className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
            >
              <FiMic />
              Generar Speech
            </button>
            <button
              onClick={reset}
              className="bg-slate-700 hover:bg-slate-600 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div>
          {generatedSpeech ? (
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-3">📋 Tickets ({generatedSpeech.tickets.length})</h3>
                <div className="space-y-2">
                  {generatedSpeech.tickets.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900 rounded-lg px-3 py-2">
                      <span className="text-xs text-blue-400 font-mono font-bold">{t.ticketId}</span>
                      <span className="text-xs text-gray-300 flex-1 truncate">{t.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-300">📝 Speech estructurado</h3>
                  <button onClick={() => copySpeech(generatedSpeech.speechText)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    {copied && !aiSpeech ? <FiCheck className="text-green-400" /> : <FiCopy />}
                    Copiar
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-gray-300 text-xs leading-relaxed whitespace-pre-line font-mono">
                  {generatedSpeech.speechText}
                </div>
              </div>

              <button
                onClick={handleAIEnhance}
                disabled={aiLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? <FiLoader className="animate-spin" /> : <FiZap />}
                {aiLoading ? 'Generando versión natural...' : '✨ Hacerlo sonar natural con IA'}
              </button>

              {aiError && (
                <div className="text-xs text-red-400 text-center">{aiError}</div>
              )}

              {aiSpeech && (
                <div className="card border-purple-500/30 bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      🎤 Speech con IA
                      <span className="text-xs font-normal text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">powered by Groq</span>
                    </h3>
                    <button onClick={() => copySpeech(aiSpeech)} className="btn-primary text-sm flex items-center gap-1">
                      {copied && aiSpeech ? <FiCheck /> : <FiCopy />}
                      Copiar
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-lg p-5 text-gray-200 text-sm leading-relaxed whitespace-pre-line border border-purple-900/50">
                    {aiSpeech}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Esta versión suena más conversacional — lista para decir en tu daily.
                  </p>
                </div>
              )}

              <button
                onClick={reset}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <FiRefreshCw />
                Empezar de nuevo
              </button>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FiMic className="text-4xl mx-auto mb-3 text-gray-600" />
                <p>Agrega tus tickets y genera el speech</p>
                <p className="text-xs mt-2 text-gray-600">Luego usa IA para que suene natural ✨</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailySpeechModule
