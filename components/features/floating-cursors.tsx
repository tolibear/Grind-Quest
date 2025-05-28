'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useState, useRef } from 'react'
import { ExternalLink } from 'lucide-react'

interface UserPresence {
  user_id: string
  username: string
  avatar: string
  cursor: { x: number; y: number }
  typing?: string
  lastSeen: string
}

interface FloatingCursorsProps {
  users: Record<string, UserPresence>
  currentUserId: string
  currentUserTyping?: string
  recentMessages: Array<{
    user_id: string
    message: string
    timestamp: string
  }>
}

export function FloatingCursors({ users, currentUserId, currentUserTyping, recentMessages }: FloatingCursorsProps) {
  const [visibleMessages, setVisibleMessages] = useState<Record<string, {
    message: string
    timestamp: string
  }>>({})
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const processedMessagesRef = useRef<Set<string>>(new Set())

  // Track mouse position for current user's message
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Handle new messages - show for 3 seconds then fade
  useEffect(() => {
    // Process only new messages that haven't been processed yet
    recentMessages.forEach(msg => {
      const messageKey = `${msg.user_id}-${msg.timestamp}`
      
      // Skip if we've already processed this message
      if (processedMessagesRef.current.has(messageKey)) {
        return
      }
      
      // Mark as processed
      processedMessagesRef.current.add(messageKey)
      
      // Add the message to visible messages
      setVisibleMessages(prev => ({
        ...prev,
        [msg.user_id]: {
          message: msg.message,
          timestamp: msg.timestamp
        }
      }))

      // Remove after 3 seconds
      setTimeout(() => {
        setVisibleMessages(prev => {
          const updated = { ...prev }
          // Only remove if it's the same message (in case a new one came in)
          if (updated[msg.user_id]?.timestamp === msg.timestamp) {
            delete updated[msg.user_id]
          }
          return updated
        })
        
        // Clean up processed messages set after a delay
        setTimeout(() => {
          processedMessagesRef.current.delete(messageKey)
        }, 1000)
      }, 3000)
    })
  }, [recentMessages])

  const currentUserMessage = visibleMessages[currentUserId]

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {/* Other users' cursors */}
        {Object.entries(users).map(([userId, user]) => {
          // Don't show current user's cursor here
          if (userId === currentUserId) return null
          
          const userMessage = visibleMessages[userId]
          const isActive = !!(user.typing || userMessage)
          const isHovered = hoveredUser === userId
          
          return (
            <motion.div
              key={userId}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: user.cursor.x,
                y: user.cursor.y
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                type: "spring", 
                damping: 40, // Increased for less oscillation
                stiffness: 400, // Increased for faster response
                mass: 0.2, // Reduced for lighter feel
                opacity: { duration: 0.15 }
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                {/* Hover Tooltip with Twitter Link */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-auto"
                    >
                      <a
                        href={`https://twitter.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border text-foreground px-2 py-1 rounded-md shadow-lg text-xs hover:bg-muted transition-colors"
                      >
                        @{user.username}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* User Avatar - smaller by default, larger when active */}
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.25
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="pointer-events-auto"
                  onMouseEnter={() => setHoveredUser(userId)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  <Avatar className={`${isActive ? 'h-12 w-12' : 'h-12 w-12'} border-2 border-primary shadow-lg`}>
                    <AvatarImage 
                      src={user.avatar} 
                      alt={user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                {/* Typing Indicator (real-time typing) - pushed down to avoid overlap */}
                {user.typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-xs"
                  >
                    <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm relative">
                      {user.typing}
                      {/* Speech bubble arrow */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                    </div>
                  </motion.div>
                )}

                {/* Transient Message Display - positioned below typing or avatar */}
                <AnimatePresence>
                  {userMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute ${user.typing ? 'top-28' : 'top-16'} left-1/2 -translate-x-1/2 whitespace-nowrap max-w-xs`}
                    >
                      <div className="bg-background/95 backdrop-blur-sm border text-foreground px-3 py-2 rounded-lg shadow-lg text-sm relative">
                        {userMessage.message}
                        {/* Speech bubble arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background/95 border-l border-t rotate-45"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}

        {/* Current user's typing/message below cursor */}
        <AnimatePresence>
          {(currentUserTyping || currentUserMessage) && (
            <motion.div
              key="current-user-message"
              className="absolute"
              initial={{
                x: mousePosition.x,
                y: mousePosition.y + 30,
                opacity: 0,
                scale: 0.8
              }}
              animate={{
                x: mousePosition.x,
                y: mousePosition.y + 30,
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.8
              }}
              transition={{
                x: {
                  type: "spring",
                  damping: 40,
                  stiffness: 400,
                  mass: 0.1
                },
                y: {
                  type: "spring",
                  damping: 40,
                  stiffness: 400,
                  mass: 0.1
                },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
            >
              <div className="relative -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm relative">
                  {currentUserTyping || currentUserMessage?.message}
                  {currentUserTyping && <span className="animate-pulse">|</span>}
                  {/* Speech bubble arrow pointing up */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  )
} 