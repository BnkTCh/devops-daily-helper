import { Link, useLocation } from 'react-router-dom'
import { FiTerminal, FiHome, FiAlertTriangle, FiFileText, FiMic } from 'react-icons/fi'

const navItems = [
  { path: '/', label: 'Inicio', icon: FiHome },
  { path: '/troubleshooting', label: 'Troubleshooting', icon: FiAlertTriangle },
  { path: '/yaml-generator', label: 'YAML Generator', icon: FiFileText },
  { path: '/daily-speech', label: 'Daily Speech', icon: FiMic },
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FiTerminal className="text-primary text-2xl" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DevOps Daily Helper
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="text-lg" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
