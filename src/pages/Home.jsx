import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import MainFeature from '../components/MainFeature'
import { getIcon } from '../utils/iconUtils'

const LeafIcon = getIcon('leaf')
const FlowerIcon = getIcon('flower')
const SparklesIcon = getIcon('sparkles')

const Home = ({ isDarkMode }) => {
  const [currentLevel, setCurrentLevel] = useState(1)
  
  const handleLevelComplete = (level) => {
    toast.success(`Level ${level} completed! 🎉`)
    setCurrentLevel(level + 1)
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Background decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 text-primary-light/20 dark:text-primary/20"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <FlowerIcon className="w-40 h-40" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-20 right-20 text-secondary-light/20 dark:text-secondary/20"
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <FlowerIcon className="w-32 h-32" />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/3 right-1/4 text-accent/20"
          animate={{ 
            y: [0, -30, 0],
            x: [0, 10, 0],
            rotate: 15
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <LeafIcon className="w-24 h-24" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 left-1/4 text-pink-400/20 dark:text-pink-300/20"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -15, 0],
            rotate: -20
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <LeafIcon className="w-20 h-20" />
        </motion.div>
      </div>
      
      {/* Header */}
      <header className="w-full py-6 px-4 text-center relative z-10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
              <span className="inline-block">
                <span className="gradient-text">Lexi</span>
                <SparklesIcon className="inline-block w-8 h-8 md:w-10 md:h-10 text-yellow-400 ml-1 animate-pulse-glow" />
                <span className="gradient-text">Bloom</span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
              Connect letters to form words in a beautiful, relaxing environment
            </p>
          </motion.div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 rounded-full bg-white/70 dark:bg-surface-800/70 backdrop-blur-sm shadow-md">
              <h2 className="text-xl font-medium">
                Level {currentLevel} 
                <span className="ml-2 text-primary dark:text-primary-light">
                  {currentLevel === 1 ? "Blooming Start" : 
                   currentLevel === 2 ? "Petal Power" : 
                   currentLevel === 3 ? "Word Garden" : "Master Wordsmith"}
                </span>
              </h2>
            </div>
          </div>
          
          <MainFeature 
            level={currentLevel} 
            onLevelComplete={handleLevelComplete}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-4 px-4 text-center text-surface-500 dark:text-surface-400 text-sm z-10">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} LexiBloom - A relaxing word puzzle game</p>
        </div>
      </footer>
    </div>
  )
}

export default Home