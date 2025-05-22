import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Settings from './components/Settings'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { Settings as SettingsIcon } from 'lucide-react'

function AppContent() {
  const { isDarkMode, toggleDarkMode, currentTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background} dark:${currentTheme.darkBackground} transition-colors duration-300`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
        className="z-50"
      />
      
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm dark:bg-gray-800/30 shadow-soft hover:bg-white/30 dark:hover:bg-gray-800/50 transition-all"
            aria-label="Open settings"
          >
            <SettingsIcon className="h-5 w-5 text-primary" />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm dark:bg-gray-800/30 shadow-soft hover:bg-white/30 dark:hover:bg-gray-800/50 transition-all"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <Routes>
        <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App