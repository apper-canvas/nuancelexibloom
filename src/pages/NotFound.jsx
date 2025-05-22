import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getIcon } from '../utils/iconUtils'

const ArrowLeftIcon = getIcon('arrow-left')
const FileQuestionIcon = getIcon('file-question')

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card-neu max-w-lg w-full text-center"
      >
        <div className="mb-6">
          <FileQuestionIcon className="w-24 h-24 mx-auto text-primary/70 dark:text-primary-light/70" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-surface-600 dark:text-surface-300 mb-8">
          Oops! It seems you've ventured into uncharted territory. 
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium transition-all hover:shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default NotFound