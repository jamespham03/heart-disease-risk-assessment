import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import Results from './pages/Results'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="results" element={<Results />} />
      </Route>
    </Routes>
  )
}

export default App
