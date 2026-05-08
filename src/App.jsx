import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TroubleshootingModule from './modules/troubleshooting/TroubleshootingModule'
import YamlGeneratorModule from './modules/yaml-generator/YamlGeneratorModule'
import DailySpeechModule from './modules/daily-speech/DailySpeechModule'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/troubleshooting" element={<TroubleshootingModule />} />
        <Route path="/yaml-generator" element={<YamlGeneratorModule />} />
        <Route path="/daily-speech" element={<DailySpeechModule />} />
      </Routes>
    </Layout>
  )
}

export default App
