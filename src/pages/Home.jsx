import { FiAlertTriangle, FiFileText, FiMic } from 'react-icons/fi'
import ModuleCard from '../components/ModuleCard'

const modules = [
  {
    title: 'Troubleshooting',
    description: 'Pega cualquier error o describe un problema — la IA lo diagnostica y te da soluciones paso a paso. Funciona con K8s, Docker, Terraform, AWS, CI/CD, Linux, bases de datos y más.',
    icon: FiAlertTriangle,
    path: '/troubleshooting',
    color: 'blue',
  },
  {
    title: 'Generador de YAMLs',
    description: 'Describe lo que necesitas en lenguaje natural y la IA genera el manifiesto de Kubernetes listo para usar. Deployments, Services, Ingress, HPA, CronJobs y más.',
    icon: FiFileText,
    path: '/yaml-generator',
    color: 'purple',
  },
  {
    title: 'Daily Speech',
    description: 'Agrega tus tickets, llena los campos con copy-paste y genera tu speech para el daily en inglés. Usa IA para que suene natural y conversacional.',
    icon: FiMic,
    path: '/daily-speech',
    color: 'green',
  },
]

function Home() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          DevOps Daily Helper
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Tu asistente para el día a día en DevOps. Troubleshooting con IA, generación de YAMLs y preparación de dailies — todo en un solo lugar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.path} {...module} />
        ))}
      </div>
      <footer className="text-center mt-16 text-gray-400 text-sm">
        Realizado por Bianca Torres ❤️
      </footer>
    </div>
  )
}

export default Home
