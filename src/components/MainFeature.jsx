import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Check, RefreshCw, Trophy, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getIcon } from '../utils/iconUtils'

const RefreshIcon = getIcon('refresh-cw')
const CheckIcon = getIcon('check-circle')
const XIcon = getIcon('x')
const HelpCircleIcon = getIcon('help-circle')
const RotateCcwIcon = getIcon('rotate-ccw')
const ClockIcon = getIcon('clock')

// Game puzzles data
const puzzleData = [
  {
    letters: ['A', 'P', 'E', 'L', 'T', 'S', 'R'],
    words: ['PETAL', 'LEAP', 'STEAL', 'PEAR', 'PALE', 'PEARL', 'TALE'],
    hint: "Think of flowers and gentle movements",
    crossword: [
      ['E', '', '', '', 'E'],
      ['A', '', 'T', '', 'A'],
      ['R', '', 'A', '', 'P'],
      ['L', 'E', 'L', 'E', '']
    ]
  },
  {
    letters: ['D', 'R', 'E', 'A', 'M', 'W', 'O'],
    words: ['DREAM', 'WADER', 'WORE', 'MODE', 'ROAM', 'MOWER', 'WORD'],
    hint: "Words about thoughts and actions",
    crossword: [
      ['', 'D', 'R', 'E', 'A', 'M'],
      ['W', 'O', 'R', 'D', '', 'O'],
      ['A', '', 'O', '', '', 'D'],
      ['D', '', 'A', '', '', 'E'],
      ['E', '', 'M', 'O', 'W', 'E', 'R'],
      ['R', '', '', '', '', '']
    ]
  },
  {
    letters: ['B', 'L', 'O', 'S', 'M', 'I', 'N'],
    words: ['BLOOM', 'SOIL', 'LIMB', 'MOONS', 'LOIN', 'SLOB', 'OILS'],
    hint: "Garden and nature related words",
    crossword: [
      ['B', 'L', 'O', 'O', 'M'],
      ['', 'I', 'I', '', 'O'],
      ['S', 'M', 'L', '', 'O'],
      ['L', 'B', 'S', 'O', 'N'],
      ['O', '', '', 'I', 'S'],
      ['B', '', '', 'L', '']
    ]
  }
]

// Hint system configuration
const HINT_CONFIG = {
  maxHints: 3,
  cooldownMinutes: 10,
  hintDurationSeconds: 10
}

const MainFeature = ({ level, onLevelComplete, isDarkMode }) => {
  const currentPuzzle = puzzleData[level - 1] || puzzleData[0]
  const { currentTheme } = useTheme();

  const [selectedLetters, setSelectedLetters] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [foundWords, setFoundWords] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [letterPositions, setLetterPositions] = useState([])
  const [previousPositions, setPreviousPositions] = useState([])
  const wheelRef = useRef(null)
  const [animation, setAnimation] = useState({ show: false, type: '', word: '' })
  // Hint system states
  const [remainingHints, setRemainingHints] = useState(HINT_CONFIG.maxHints)
  const [hintCooldown, setHintCooldown] = useState(0)
  const [activeHint, setActiveHint] = useState(null)
  const cooldownTimerRef = useRef(null)
  const [currentLevel, setCurrentLevel] = useState('level1');
  
  // Set up letter positions in a circle
  useEffect(() => {
    if (wheelRef.current) {
      const centerX = wheelRef.current.offsetWidth / 2
      const centerY = wheelRef.current.offsetHeight / 2
      const radius = Math.min(centerX, centerY) * 0.7
      
      const positions = currentPuzzle.letters.map((letter, index) => {
        const angle = (index / currentPuzzle.letters.length) * 2 * Math.PI
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        return { letter, x, y, index }
      })
      
      setLetterPositions(positions)
      setPreviousPositions(positions)
      
      // Reset game state when level changes
      setSelectedLetters([])
      setCurrentWord('')
      setFoundWords([])
      setShowHint(false) 
      setActiveHint(null)
    }
  }, [level, currentPuzzle])

  // Load hint data from localStorage on component mount
  useEffect(() => {
    const savedHintData = localStorage.getItem('wordscapesHintData')
    if (savedHintData) {
      const parsedData = JSON.parse(savedHintData)
      setRemainingHints(parsedData.remainingHints)
      
      const lastUsedTime = new Date(parsedData.lastUsedTime)
      const now = new Date()
      const diffMs = now - lastUsedTime
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      
      if (diffMinutes < HINT_CONFIG.cooldownMinutes) {
        const remainingCooldown = HINT_CONFIG.cooldownMinutes - diffMinutes
        setHintCooldown(remainingCooldown * 60) // Convert to seconds
        startCooldownTimer()
      }
    }
  }, [])

  // Save hint data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wordscapesHintData', JSON.stringify({
      remainingHints,
      lastUsedTime: hintCooldown > 0 ? new Date().toISOString() : null
    }))
  }, [remainingHints, hintCooldown])

  // Clear active hint after duration expires
  useEffect(() => {
    if (activeHint) {
      const timer = setTimeout(() => {
        setActiveHint(null)
      }, HINT_CONFIG.hintDurationSeconds * 1000)
      
      return () => clearTimeout(timer)
    }
  }, [activeHint])

  // Start cooldown timer
  const startCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current)
    }
    
    cooldownTimerRef.current = setInterval(() => {
      setHintCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current)
      }
    }
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])
  
  // Get cross-browser pointer position
  const getPointerPosition = (e) => {
    const pointer = e.touches ? e.touches[0] : e
    const rect = wheelRef.current.getBoundingClientRect()
    return {
      x: pointer.clientX - rect.left,
      y: pointer.clientY - rect.top
    }
  }
  
  // Start drawing line
  const handlePointerDown = (index) => {
    if (!selectedLetters.includes(index)) {
      setIsDrawing(true)
      setSelectedLetters([index])
      setCurrentWord(currentPuzzle.letters[index])
    }
  }
  
  // Continue drawing line if near a letter
  const handlePointerMove = (e) => {
    if (!isDrawing || !wheelRef.current) return
    
    const position = getPointerPosition(e)
    
    // Check if pointer is near any unselected letter
    letterPositions.forEach((letterPos, index) => {
      if (!selectedLetters.includes(index)) {
        const distance = Math.sqrt(
          Math.pow(position.x - letterPos.x, 2) + 
          Math.pow(position.y - letterPos.y, 2)
        )
        
        if (distance < 40) {
          if (!selectedLetters.includes(index)) {
            setSelectedLetters(prev => [...prev, index])
            setCurrentWord(prev => prev + currentPuzzle.letters[index])
          }
        }
      }
    })
  }
  
  // End drawing line and check word
  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      checkWord()
    }
  }
  
  // Check if word is valid
  const checkWord = () => {
    if (currentWord.length < 2) {
      // Word is too short but don't show negative feedback
      setSelectedLetters([])
      return
    }
    if (currentPuzzle.words.includes(currentWord) && !foundWords.includes(currentWord)) {
      // Found a new valid word
      showWordAnimation(true, currentWord)
      setFoundWords(prev => [...prev, currentWord])
      
      // Check if all words are found
      if (foundWords.length + 1 === currentPuzzle.words.length) {
        setTimeout(() => {
          onLevelComplete(level)
        }, 1500)
      }
    } else if (foundWords.includes(currentWord)) {
      // Word already found
      toast.info('Nice memory! You already found this word.')
    } else if (currentWord.length >= 3) {
      // Valid word length but not in our list - give positive feedback anyway
      toast.success('Creative word! Keep exploring!')
    } else {
      // Too short or invalid - just reset without negative feedback
      setSelectedLetters([])
    }
    
    // Reset current selection
    setSelectedLetters([])
    setCurrentWord('')
  }
  
  // Show animation for valid/invalid words
  const showWordAnimation = (isValid, word) => {
    setAnimation({
      show: true,
      type: isValid ? 'valid' : 'invalid',
      word
    })
    
    setTimeout(() => {
      setAnimation({ show: false, type: '', word: '' })
    }, 1500)
  }
  
  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(prev => !prev)
  }

  // Use a hint to show possible word connections
  const useHint = () => {
    if (remainingHints <= 0) {
      toast.error("No hint attempts remaining!")
      return
    }
    
    if (hintCooldown > 0) {
      const minutes = Math.floor(hintCooldown / 60)
      const seconds = hintCooldown % 60
      toast.info(`Hint on cooldown: ${minutes}m ${seconds}s remaining`)
      return
    }

    // Find a word that hasn't been discovered yet
    const unsolvedWords = currentPuzzle.words.filter(word => !foundWords.includes(word))
    
    if (unsolvedWords.length === 0) { 
      return
    }
    
    // Select a random unsolved word
    const targetWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)]
    
    // Create a hint for the word
    const hintLetters = []
    
    // Find positions of first 2-3 letters of the word
    const hintLength = Math.min(Math.ceil(targetWord.length / 2), 3)
    for (let i = 0; i < hintLength; i++) {
      const letter = targetWord[i]
      const letterIndex = currentPuzzle.letters.findIndex(l => l === letter)
      if (letterIndex !== -1 && !hintLetters.includes(letterIndex)) {
        hintLetters.push(letterIndex)
      }
    }
    
    // Set active hint
    setActiveHint({
      letterIndices: hintLetters,
      word: targetWord
    })
    
    // Decrease remaining hints and start cooldown
    setRemainingHints(prev => prev - 1)
    setHintCooldown(HINT_CONFIG.cooldownMinutes * 60) // Convert minutes to seconds
    startCooldownTimer()
    
    toast.success(`Hint used! ${remainingHints - 1} remaining.`, {
      autoClose: 2000
    })
  }
  
  
  // Reset current level
  const resetLevel = () => {
    setSelectedLetters([])
    setCurrentWord('')
    setFoundWords([])
    setShowHint(false)
    setActiveHint(null)
  }
  
  // Generate the crossword grid cells
  const renderCrosswordGrid = () => {
    return currentPuzzle.crossword.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex">
        {row.map((cell, colIndex) => {
          const isFilled = foundWords.some(word => {
            // Simplified check - if this cell contains a letter that appears at the start of any found word
            return cell !== '' && 
                  (word.startsWith(cell) || word.endsWith(cell)) &&
                  Math.random() > 0.5 // Add some randomness to make it visually interesting
          })

          return (
            <div 
              key={`cell-${rowIndex}-${colIndex}`}
              className={`crossword-cell ${cell === '' ? 'opacity-0' : ''} ${isFilled ? 'filled' : ''}`}
            >
              {cell}
            </div>
          )
        })}
      </div>
    ))
  }
  
  // Format cooldown time as MM:SS
  const formatCooldownTime = () => {
    if (hintCooldown <= 0) return "Ready"
    const minutes = Math.floor(hintCooldown / 60)
    const seconds = hintCooldown % 60
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  }

  return (
    <div className="relative p-4 max-w-4xl mx-auto min-h-[80vh] flex flex-col" style={{ '--color-primary': currentTheme.primary, '--color-secondary': currentTheme.secondary, '--color-accent': currentTheme.accent }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Word list and controls */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="card-neu h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <HelpCircleIcon className="w-5 h-5 mr-2 text-primary" />
                Word Challenge
              </h3>
              <p className="text-surface-600 dark:text-surface-300 text-sm">
                Find all {currentPuzzle.words.length} words using the letters
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="grid grid-cols-2 gap-2">
                {currentPuzzle.words.map((word, index) => (
                  <div 
                    key={word}
                    className={`p-2 rounded-lg text-center ${
                      foundWords.includes(word) 
                        ? 'bg-primary/20 dark:bg-primary/30 text-primary-dark dark:text-primary-light font-medium' 
                        : 'bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-500'
                    }`}
                  >
                    {foundWords.includes(word) ? word : `${word.length} letters`}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-col gap-3">
                {/* Hint button with cooldown */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={useHint}
                    disabled={remainingHints <= 0 || hintCooldown > 0 || activeHint !== null}
                    className={`btn flex items-center justify-center gap-2 ${
                      remainingHints <= 0 
                        ? 'bg-surface-200 dark:bg-surface-700 text-surface-400 dark:text-surface-500' 
                        : hintCooldown > 0
                          ? 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400' 
                          : 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary-dark dark:text-primary-light'
                    }`}
                    aria-label="Use a hint"
                  >
                    <HelpCircleIcon className="w-5 h-5" />
                    {activeHint ? "Hint Active" : remainingHints <= 0 ? "No Hints Left" : "Use a Hint"}
                  </button>
                  
                  {/* Cooldown timer bar */}
                  {hintCooldown > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="cooldown-timer">
                        <div 
                          className="cooldown-progress" 
                          style={{ 
                            width: `${100 - (hintCooldown / (HINT_CONFIG.cooldownMinutes * 60) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatCooldownTime()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Hint attempts indicators */}
                  <div className="flex justify-center gap-2 mt-1">
                    {[...Array(HINT_CONFIG.maxHints)].map((_, i) => (
                      <div key={i} className={`hint-pip ${i < remainingHints ? 'bg-primary' : 'bg-surface-300 dark:bg-surface-600'}`}></div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={toggleHint}
                  className="btn flex items-center justify-center gap-2 bg-secondary/10 dark:bg-secondary/20 hover:bg-secondary/20 dark:hover:bg-secondary/30 text-secondary-dark dark:text-secondary-light"
                >
                  <HelpCircleIcon className="w-5 h-5" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-yellow-800 dark:text-yellow-200"
                    >
                      <p>{currentPuzzle.hint}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={resetLevel}
                  className="btn flex items-center justify-center gap-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200"
                >
                  <RotateCcwIcon className="w-5 h-5" />
                  Reset Level
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center column - Letter wheel game */}
        <div className="md:col-span-2 order-1 md:order-2">
          <div className="card-neu">
            {/* Word display area */}
            <div className="word-display mb-6 relative">
              {currentWord && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-primary dark:text-primary-light"
                >
                  {currentWord}
                </motion.div>
              )}
              
              {!currentWord && (
                <div className="text-surface-400 dark:text-surface-500">
                  Connect letters to form words (even short ones!)
                </div>
              )}
              
              {/* Animation for valid/invalid words */}
              <AnimatePresence>
                {animation.show && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`absolute inset-0 flex items-center justify-center ${
                      animation.type === 'valid' 
                        ? 'text-green-500 dark:text-green-400' 
                        : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {animation.type === 'valid' ? (
                        <CheckIcon className="w-6 h-6" />
                      ) : (
                        <XIcon className="w-6 h-6" />
                      )}
                      {animation.word}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Crossword display */}
            <div className="mb-6">
              <div className="crossword-grid">
                {renderCrosswordGrid()}
              </div>
            </div>
            
            {/* Letter wheel game area */}
            <div 
              ref={wheelRef} 
              className="letter-wheel mx-auto"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {letterPositions.map((letterPos, index) => (
                <div
                  key={index}
                  className={`letter-cell ${selectedLetters.includes(index) ? 'selected' : ''}`}
                  style={{
                    left: `${letterPos.x - 30}px`,
                    top: `${letterPos.y - 30}px`
                  }}
                  onPointerDown={() => handlePointerDown(index)}
                  onTouchStart={() => handlePointerDown(index)}
                >
                  {letterPos.letter}
                </div>
              ))}
              
              {/* Draw connecting lines between selected letters */}
              <svg 
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height="100%"
                style={{ zIndex: 5 }}
              >
                {selectedLetters.length > 1 && selectedLetters.map((letterIndex, i) => {
                  if (i === selectedLetters.length - 1) return null
                  
                  const startPos = letterPositions[letterIndex]
                  const endPos = letterPositions[selectedLetters[i + 1]]
                  
                  return (
                    <line
                      key={`line-${i}`}
                      x1={startPos.x}
                      y1={startPos.y}
                      x2={endPos.x}
                      y2={endPos.y}
                      stroke={isDarkMode ? "#a78bfa" : "#8a5cf7"}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )
                })}
                
                {/* Hint overlay */}
                {activeHint && (
                  <>
                    {/* Highlight circles for hint letters */}
                    {activeHint.letterIndices.map((letterIndex, i) => {
                      const pos = letterPositions[letterIndex]
                      return (
                        <div
                          key={`hint-${letterIndex}`}
                          className="hint-overlay"
                          style={{
                            left: `${pos.x - 36}px`,
                            top: `${pos.y - 36}px`,
                            width: '72px',
                            height: '72px'
                          }}
                        ></div>
                      )
                    })}
                    
                    {/* Connection lines between hint letters */}
                    {activeHint.letterIndices.length > 1 && activeHint.letterIndices.map((letterIndex, i) => {
                      if (i === activeHint.letterIndices.length - 1) return null
                      const startPos = letterPositions[letterIndex]
                      const endPos = letterPositions[activeHint.letterIndices[i + 1]]
                      return (
                        <line key={`hint-line-${i}`} x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke={isDarkMode ? "#a78bfa80" : "#8a5cf780"} strokeWidth="5" className="hint-connection" />
                      )
                    })}
                  </>
                )}
              </svg>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6 text-center">
              <div className="inline-block bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <span className="text-surface-700 dark:text-surface-300">
                  {foundWords.length} / {currentPuzzle.words.length} words found
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Level complete modal */}
      <AnimatePresence>
        {foundWords.length === currentPuzzle.words.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full shadow-lg"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white"
                >
                  <CheckIcon className="w-10 h-10" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">Level Complete!</h2>
                <p className="text-surface-600 dark:text-surface-300 mb-6">
                  {level < puzzleData.length 
                    ? "Great job! Moving to the next level..." 
                    : "Congratulations! You've completed all levels!"}
                </p>
                
                {level >= puzzleData.length && (
                  <button
                    onClick={() => onLevelComplete(0)}
                    className="btn-primary w-full"
                  >
                    <RefreshIcon className="w-5 h-5 mr-2 inline-block" />
                    Play Again
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature