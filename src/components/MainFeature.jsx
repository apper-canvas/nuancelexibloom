import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { getIcon } from '../utils/iconUtils'

const RefreshIcon = getIcon('refresh-cw')
const CheckIcon = getIcon('check-circle')
const XIcon = getIcon('x')
const HelpCircleIcon = getIcon('help-circle')
const BrainIcon = getIcon('brain')
const RotateCcwIcon = getIcon('rotate-ccw')

// Game puzzles data
const puzzleData = [
  // Level 1
  {
    letters: ['A', 'P', 'E', 'L', 'T', 'S', 'R'],
    words: ['PETAL', 'LEAP', 'STEAL', 'PEAR', 'PALE', 'PEARL', 'TALE'],
    hint: "Think of flowers and gentle movements",
    crossword: [
      ['P', 'E', 'T', 'A', 'L'],
      ['E', '', '', '', 'E'],
      ['A', '', 'T', '', 'A'],
      ['R', '', 'A', '', 'P'],
      ['L', 'E', 'L', 'E', '']
    ]
  },
  // Level 2
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
  // Level 3
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

const MainFeature = ({ level, onLevelComplete, isDarkMode }) => {
  const currentPuzzle = puzzleData[level - 1] || puzzleData[0]
  
  const [selectedLetters, setSelectedLetters] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [foundWords, setFoundWords] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [letterPositions, setLetterPositions] = useState([])
  const [previousPositions, setPreviousPositions] = useState([])
  const wheelRef = useRef(null)
  const [animation, setAnimation] = useState({ show: false, type: '', word: '' })
  
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
    }
  }, [level, currentPuzzle])
  
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
        
        // If close enough to a letter, select it
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
    if (currentWord.length < 3) {
      // Reset if word is too short
      setSelectedLetters([])
      setCurrentWord('')
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
      toast.info('Word already found!')
    } else {
      // Invalid word
      showWordAnimation(false, currentWord)
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
  
  // Reset current level
  const resetLevel = () => {
    setSelectedLetters([])
    setCurrentWord('')
    setFoundWords([])
    setShowHint(false)
  }
  
  // Generate the crossword grid cells
  const renderCrosswordGrid = () => {
    return currentPuzzle.crossword.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex">
        {row.map((cell, colIndex) => {
          const isFilled = foundWords.some(word => {
            // Check if this cell is part of any found word
            return currentPuzzle.crossword.some((r, ri) => {
              return r.some((c, ci) => {
                if (ri === rowIndex && ci === colIndex && c !== '') {
                  // Check horizontal right
                  if (ci + word.length <= r.length) {
                    let match = true
                    for (let i = 0; i < word.length; i++) {
                      if (r[ci + i] !== word[i]) {
                        match = false
                        break
                      }
                    }
                    if (match) return true
                  }
                  
                  // Check vertical down
                  if (ri + word.length <= currentPuzzle.crossword.length) {
                    let match = true
                    for (let i = 0; i < word.length; i++) {
                      if (currentPuzzle.crossword[ri + i][ci] !== word[i]) {
                        match = false
                        break
                      }
                    }
                    if (match) return true
                  }
                }
                return false
              })
            })
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Word list and controls */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="card-neu h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <BrainIcon className="w-5 h-5 mr-2 text-primary" />
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
                  Connect letters to form words
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