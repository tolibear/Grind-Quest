'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface CursorChatProps {
  onSendMessage: (message: string) => Promise<boolean>
  onTyping: (text: string) => void
  isConnected: boolean
}

const MAX_TYPING_LENGTH = 50

export function CursorChat({ 
  onSendMessage, 
  onTyping,
  isConnected 
}: CursorChatProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')

  const handleSendMessage = useCallback(async () => {
    if (currentMessage.trim()) {
      // Clear immediately when sending
      setCurrentMessage('')
      setIsTyping(false)
      onTyping('')
      
      // Then send the message
      await onSendMessage(currentMessage.trim())
    }
  }, [currentMessage, onSendMessage, onTyping])

  // Handle global keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Start typing mode on any letter/number key
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        if (!isTyping) {
          const newChar = e.key
          if (newChar.length <= MAX_TYPING_LENGTH) {
            setIsTyping(true)
            setCurrentMessage(newChar)
            onTyping(newChar)
          }
        } else {
          const newMessage = currentMessage + e.key
          if (newMessage.length <= MAX_TYPING_LENGTH) {
            setCurrentMessage(newMessage)
            onTyping(newMessage)
          }
        }
      }
      
      // Handle backspace
      else if (e.key === 'Backspace' && isTyping) {
        e.preventDefault()
        const newMessage = currentMessage.slice(0, -1)
        setCurrentMessage(newMessage)
        onTyping(newMessage)
        
        if (newMessage === '') {
          setIsTyping(false)
          onTyping('')
        }
      }
      
      // Send message on Enter
      else if (e.key === 'Enter' && isTyping && currentMessage.trim()) {
        e.preventDefault()
        handleSendMessage()
      }
      
      // Cancel typing on Escape
      else if (e.key === 'Escape' && isTyping) {
        e.preventDefault()
        setIsTyping(false)
        setCurrentMessage('')
        onTyping('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTyping, currentMessage, onTyping, handleSendMessage])

  return (
    <>
      {/* Info bar - always visible in bottom right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm text-muted-foreground">
            Start typing to chat • <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel
          </p>
          {isTyping && (
            <p className="text-xs text-muted-foreground mt-1">
              {currentMessage.length}/{MAX_TYPING_LENGTH} characters
            </p>
          )}
        </div>
      </motion.div>
    </>
  )
} 