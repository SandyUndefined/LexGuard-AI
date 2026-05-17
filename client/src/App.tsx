import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import History from './pages/History';
import BackendStatus from './components/BackendStatus';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        {/* Global ambient background glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-10"
            style={{
              background: 'radial-gradient(ellipse at center, #8b5cf6 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <Navbar />
        <BackendStatus />

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
