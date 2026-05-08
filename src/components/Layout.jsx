import Navbar from './Navbar'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-800 py-4 text-center text-gray-500 text-sm">
        DevOps Daily Helper — Hecho con Kiro + React + Vite | Deploy: AWS Amplify
      </footer>
    </div>
  )
}

export default Layout
