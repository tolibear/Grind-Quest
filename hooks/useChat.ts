'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  user_id: string
  username: string
  avatar: string
  message: string
  timestamp: string
}

interface UseChatOptions {
  roomId?: string
  maxMessages?: number
}

export function useChat(
  currentUser: { id: string; username: string; avatar: string },
  options: UseChatOptions = {}
) {
  const { roomId = 'main', maxMessages = 100 } = options
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    // Don't connect if no user
    if (!currentUser.id) {
      setIsConnected(false)
      setMessages([])
      return
    }

    console.log('Setting up chat channel for user:', currentUser.id)

    // Create broadcast channel for chat
    const channel = supabaseRef.current.channel(`chat:${roomId}`, {
      config: {
        broadcast: { 
          ack: true,    // Wait for server acknowledgment
          self: false   // Don't receive own messages
        },
      },
    })

    // Listen for chat messages
    channel
      .on('broadcast', { event: 'chat-message' }, ({ payload }) => {
        const message = payload as ChatMessage
        setMessages(prev => {
          const updated = [...prev, message]
          // Keep only the last maxMessages
          return updated.slice(-maxMessages)
        })
      })
      .subscribe((status) => {
        console.log('Chat channel status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Connected to chat channel')
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to chat channel')
          setIsConnected(false)
        } else if (status === 'CLOSED') {
          console.log('Chat channel closed')
          setIsConnected(false)
        }
      })

    channelRef.current = channel

    // Cleanup
    return () => {
      console.log('Cleaning up chat channel')
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [roomId, currentUser.id, maxMessages])

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!channelRef.current || !text.trim()) return false

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      message: text.trim(),
      timestamp: new Date().toISOString()
    }

    try {
      const resp = await channelRef.current.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: message
      })

      if (resp === 'ok') {
        // Add our own message to the list since self is false
        setMessages(prev => {
          const updated = [...prev, message]
          return updated.slice(-maxMessages)
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }, [currentUser.id, currentUser.username, currentUser.avatar, maxMessages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    isConnected
  }
} 