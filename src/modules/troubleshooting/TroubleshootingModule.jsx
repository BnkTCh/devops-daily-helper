import { useState } from 'react'
import { FiCopy, FiCheck, FiAlertCircle, FiZap, FiLoader, FiSearch } from 'react-icons/fi'
import { diagnoseError } from '../../services/groqAI'

function TroubleshootingModule() {
  const [errorInput, setErrorInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copiedCommand, setCopiedCommand] = useState(null)

  const handleDiagnose = async () => {
    if (!errorInput.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const diagnosis = await diagnoseError(errorInput)
      setResult(diagnosis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCommand = (command, index) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(index)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const severityColors = {
    critical: 'text-red-400 bg-red-900/30 border-red-800',
    high: 'text-orange-400 bg-orange-900/30 border-orange-800',
    medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
    low: 'text-green-400 bg-green-900/30 border-green-800',
  }

  const categoryColors = {
    Kubernetes: 'text-blue-400 bg-blue-900/30',
    Docker: 'text-cyan-400 bg-cyan-900/30',
    Terraform: 'text-purple-400 bg-purple-900/30',
    AWS: 'text-orange-400 bg-orange-900/30',
    'CI/CD': 'text-green-400 bg-green-900/30',
    Linux: 'text-yellow-400 bg-yellow-900/30',
    Networking: 'text-indigo-400 bg-indigo-900/30',
    Database: 'text-pink-400 bg-pink-900/30',
    Other: 'text-gray-400 bg-gray-900/30',
  }

  const exampleErrors = [
    'CrashLoopBackOff: back-off 5m0s restarting failed container',
    'Error: ImagePullBackOff - Failed to pull image "myapp:latest"',
    'terraform plan: Error acquiring the state lock',
    'docker: Error response from daemon: Conflict. The container name is already in use',
    'FATAL: password authentication failed for user "postgres"',
    'Error from server (Forbidden): pods is forbidden: User cannot list resource',
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">🔧 Troubleshooting</h1>
      <p className="text-gray-400 mb-6">Pega cualquier error y obtén un diagnóstico instantáneo con pasos de solución.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Pega tu error</h3>
            <p className="text-xs text-gray-500 mb-3">
              Pega cualquier mensaje de error, log o describe el problema. Funciona con K8s, Docker, Terraform, AWS, CI/CD, Linux, bases de datos — lo que sea.
            </p>
            <textarea
              className="input-field h-40 font-mono text-xs"
              placeholder="Pega tu error aquí..."
              value={errorInput}
              onChange={e => setErrorInput(e.target.value)}
            />
            <button
              onClick={handleDiagnose}
              disabled={loading || !errorInput.trim()}
              className="btn-primary mt-3 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiSearch />}
              {loading ? 'Analizando...' : 'Diagnosticar'}
            </button>
          </div>

          {/* Example errors */}
          <div className="card">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Ejemplos — click para usar</h4>
            <div className="space-y-1">
              {exampleErrors.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setErrorInput(ex)}
                  className="w-full text-left text-xs text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded px-3 py-2 font-mono transition-colors truncate"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div>
          {error && (
            <div className="card border-red-500/50 bg-red-900/10 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <FiAlertCircle />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColors[result.category] || categoryColors.Other}`}>
                    {result.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium border ${severityColors[result.severity] || severityColors.medium}`}>
                    {result.severity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{result.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{result.rootCause}</p>
              </div>

              {/* Steps */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 Pasos de troubleshooting</h3>
                <div className="space-y-3">
                  {result.steps?.map((step, idx) => (
                    <div key={idx} className="bg-slate-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">
                          <span className="text-primary font-bold mr-2">{idx + 1}.</span>
                          {step.title}
                        </span>
                        {step.command && (
                          <button
                            onClick={() => copyCommand(step.command, idx)}
                            className="text-gray-500 hover:text-white transition-colors"
                          >
                            {copiedCommand === idx ? <FiCheck className="text-green-400" /> : <FiCopy />}
                          </button>
                        )}
                      </div>
                      {step.command && (
                        <code className="text-xs text-green-400 font-mono block bg-black/30 p-2 rounded mt-1">
                          $ {step.command}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fix */}
              <div className="card border-accent/30">
                <h3 className="text-sm font-semibold text-accent mb-2">✅ Solución más probable</h3>
                <p className="text-sm text-gray-200 leading-relaxed">{result.fix}</p>
              </div>

              {/* Tips */}
              {result.tips && result.tips.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">💡 Tips</h3>
                  <ul className="space-y-1">
                    {result.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FiZap className="text-4xl mx-auto mb-3 text-gray-600" />
                <p>Pega un error y haz click en "Diagnosticar"</p>
                <p className="text-xs mt-2 text-gray-600">Análisis con IA usando Groq</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TroubleshootingModule
