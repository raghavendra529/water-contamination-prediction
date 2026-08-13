import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Shield, Waves, Activity, BarChart3, Menu, X, Sun, Moon, BookOpen, LogOut } from 'lucide-react';
import { WaterProvider, useWaterContext } from './context/WaterContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import Prediction from './pages/Prediction';
import Analytics from './pages/Analytics';
import Precautions from './pages/Precautions';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useWaterContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Sidebar({ isOpen, setIsOpen, darkMode, toggleDarkMode }) {
  const location = useLocation();
  const { user, logout } = useWaterContext();

  const links = [
    { to: '/dashboard', label: 'Overview', icon: <Activity size={20} /> },
    { to: '/detect', label: 'Detect', icon: <Shield size={20} /> },
    { to: '/predict', label: 'Future Risks', icon: <Waves size={20} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { to: '/precautions', label: 'Precautions', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col transition-transform duration-300 ease-in-out glass dark:glass-dark`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-ocean-600 dark:text-ocean-400">AquaAI</h1>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <X size={24} />
        </button>
      </div>
      
      {/* Profile summary */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50 flex flex-col">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Session</span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mt-1">{user?.name}</span>
      </div>
      
      <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-ocean-100 text-ocean-700 dark:bg-ocean-900/50 dark:text-ocean-400 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2 shrink-0">
        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center justify-center space-x-2 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <button
          onClick={logout}
          className="flex w-full items-center justify-center space-x-2 p-3 text-sm rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium border border-red-200 dark:border-red-900/30"
        >
          <LogOut size={18} />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
}

function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Checking Dark mode initially from doc class
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const [darkMode, setDarkMode] = useState(isCurrentlyDark);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <header className="h-16 flex items-center justify-between px-6 lg:hidden glass dark:glass-dark border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold tracking-tight text-ocean-600 dark:text-ocean-400">AquaAI</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/detect" element={<Detection />} />
              <Route path="/predict" element={<Prediction />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/precautions" element={<Precautions />} />
            </Routes>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyEmail />} />
        
        {/* Protected Dashboard Ecosystem */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <PrivateLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <WaterProvider>
      <AppContent />
    </WaterProvider>
  );
}

export default App;
