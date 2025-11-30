import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
// import Assessment from './pages/Assessment'; // OLD - requires database backend
// import Results from './pages/Results';
// import Chat from './pages/Chat';
import SimpleAssessment from './pages/SimpleAssessment'; // NEW - works with /api/predict
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assessment" element={<SimpleAssessment />} />
          {/* OLD ROUTES - Require full backend with database */}
          {/* <Route path="results/:sessionId" element={<Results />} /> */}
          {/* <Route path="chat/:sessionToken" element={<Chat />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;