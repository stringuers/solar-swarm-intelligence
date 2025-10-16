import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sun, Activity, BarChart3, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sun className="w-8 h-8 text-yellow-300" />
                <div>
                  <h1 className="text-2xl font-bold">Solar Swarm Intelligence</h1>
                  <p className="text-sm text-blue-200">AI-Powered Community Energy Optimization</p>
                </div>
              </div>
              
              <nav className="flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-2 hover:text-yellow-300 transition">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/analytics" className="flex items-center space-x-2 hover:text-yellow-300 transition">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </Link>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/analytics" element={<div className="text-center py-20">Analytics Coming Soon</div>} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© 2025 Solar Swarm Intelligence | IEEE PES Energy Utopia Challenge</p>
            <p className="text-sm mt-2">Powered by Multi-Agent Reinforcement Learning</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;