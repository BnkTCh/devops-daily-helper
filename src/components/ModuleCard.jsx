import { Link } from 'react-router-dom'

function ModuleCard({ title, description, icon: Icon, path, color }) {
  const colorClasses = {
    blue: 'from-red-500 to-red-700',
    purple: 'from-red-600 to-red-800',
    green: 'from-red-400 to-red-600',
  }

  return (
    <Link to={path} className="card group cursor-pointer">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 text-sm font-medium text-red-600 group-hover:text-red-500 transition-colors">
        Abrir módulo →
      </div>
    </Link>
  )
}

export default ModuleCard
