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
    <nav className="bg-red-600 border-b border-red-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FiTerminal className="text-white text-2xl" />
            <span className="text-xl font-bold text-white">
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
                    ? 'bg-red-700 text-white'
                    : 'text-red-100 hover:text-white hover:bg-red-500'
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
