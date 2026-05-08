import { useState } from 'react'
import { FiCopy, FiCheck, FiDownload, FiZap, FiLoader } from 'react-icons/fi'
import { generateYamlWithAI } from './yamlAI'

const examples = [
  'Un deployment para una app Node.js llamada "payment-service" con 3 replicas, 256Mi de memoria, puerto 3000 y health check en /health',
  'Un ingress para my-app.example.com que apunte al service my-app en puerto 80 con TLS',
  'Un CronJob que corra todos los días a las 3am usando imagen alpine:latest y ejecute "sh -c cleanup.sh"',
  'Un HPA para el deployment my-api, mínimo 2 máximo 10 replicas, escalar al 70% de CPU',
  'Un ConfigMap llamado app-config en namespace production con keys: DATABASE_URL=postgres://db:5432/mydb, REDIS_HOST=redis.svc, LOG_LEVEL=info',
  'Un service account con un ClusterRole que permita leer pods, services y deployments',
]

function YamlGeneratorModule() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const yaml = await generateYamlWithAI(prompt)
      setResult(yaml)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyYaml = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadYaml = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">📄 Generador de YAMLs</h1>
      <p className="text-gray-400 mb-6">
        Describe lo que necesitas en lenguaje natural y la IA genera el manifiesto de Kubernetes por ti.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">¿Qué necesitas?</h3>
            <p className="text-xs text-gray-500 mb-3">
              Describe el recurso de Kubernetes que quieres. Sé tan específico como quieras — nombre, namespace, puertos, replicas, limits, etc.
            </p>
            <textarea
              className="input-field h-32 text-sm"
              placeholder="ej: Un deployment para my-api con 3 replicas, imagen my-registry/my-api:v2.1, puerto 8080, 512Mi de memory limit y readiness probe en /ready"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate() }}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="btn-secondary mt-3 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiZap />}
              {loading ? 'Generando...' : 'Generar YAML'}
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center">⌘+Enter para generar</p>
          </div>

          {/* Examples */}
          <div className="card">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Ejemplos — click para usar</h4>
            <div className="space-y-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left text-xs text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded px-3 py-2 transition-colors leading-relaxed"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div>
          {error && (
            <div className="card border-red-500/50 bg-red-900/10 mb-4">
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {result ? (
            <div className="card sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">YAML Generado</h3>
                <div className="flex gap-2">
                  <button onClick={copyYaml} className="btn-primary text-sm flex items-center gap-1">
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button onClick={downloadYaml} className="btn-secondary text-sm flex items-center gap-1">
                    <FiDownload />
                    Descargar
                  </button>
                </div>
              </div>
              <pre className="bg-black/50 rounded-lg p-4 overflow-auto max-h-[600px] text-sm font-mono text-green-400 leading-relaxed">
                {result}
              </pre>
              <p className="text-xs text-gray-500 mt-3">
                💡 Siempre revisa el YAML generado antes de aplicarlo a tu cluster.
              </p>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FiZap className="text-4xl mx-auto mb-3 text-gray-600" />
                <p>Describe lo que necesitas y haz click en "Generar YAML"</p>
                <p className="text-xs mt-2 text-gray-600">Generación con IA usando Groq</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default YamlGeneratorModule
