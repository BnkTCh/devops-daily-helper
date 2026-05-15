import { Link } from 'react-router-dom'

function ModuleCard({ title, description, icon: Icon, path, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    purple: 'from-purple-500 to-purple-700',
    green: 'from-emerald-500 to-emerald-700',
  }

  return (
    <Link to={path} className="card group cursor-pointer">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
        Abrir módulo →
      </div>
    </Link>
  )
}

export default ModuleCard
