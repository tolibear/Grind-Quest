'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { throttle } from 'lodash'

interface UserPresence {
  user_id: string
  username: string
  avatar: string
  cursor: { x: number; y: number }
  typing?: string // Current typing text
  lastSeen: string
}

interface UsePresenceOptions {
  roomId?: string
  throttleMs?: number
}

export function usePresence(
  currentUser: Omit<UserPresence, 'cursor' | 'lastSeen'>,
  options: UsePresenceOptions = {}
) {
  const { roomId = 'main', throttleMs = 16 } = options // Changed to 16ms for 60fps real-time updates
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>({})
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const currentCursorRef = useRef({ x: 0, y: 0 })
  const currentTypingRef = useRef<string>('')
  const supabaseRef = useRef(createClient())
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)

  // Stable function to track presence - memoized with useCallback
  const trackPresence = useCallback(async (updates: Partial<UserPresence> = {}) => {
    if (channelRef.current && currentUser.user_id) {
      const presence: UserPresence = {
        user_id: currentUser.user_id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        cursor: currentCursorRef.current,
        typing: currentTypingRef.current,
        lastSeen: new Date().toISOString(),
        ...updates
      }
      try {
        await channelRef.current.track(presence)
      } catch (error) {
        console.error('Error tracking presence:', error)
      }
    }
  }, [currentUser.user_id, currentUser.username, currentUser.avatar])

  // Create throttled cursor update function - stable reference
  const updateCursor = useRef(
    throttle(async (x: number, y: number) => {
      currentCursorRef.current = { x, y }
      // Update cursor position in presence data
      if (channelRef.current && currentUser.user_id) {
        const presence: UserPresence = {
          user_id: currentUser.user_id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          cursor: { x, y },
          typing: currentTypingRef.current,
          lastSeen: new Date().toISOString()
        }
        try {
          await channelRef.current.track(presence)
        } catch (error) {
          console.error('Error updating cursor:', error)
        }
      }
    }, throttleMs, { leading: true, trailing: true }) // Add leading and trailing for better responsiveness
  ).current

  // Retry connection function
  const retryConnection = useCallback(() => {
    if (retryCountRef.current < 3) {
      retryCountRef.current++
      console.log(`Retrying presence connection (attempt ${retryCountRef.current})...`)
      
      // Clear existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      
      // Retry after a delay
      retryTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.subscribe()
        }
      }, 1000 * retryCountRef.current) // Exponential backoff
    }
  }, [])

  useEffect(() => {
    // Don't connect if no user
    if (!currentUser.user_id) {
      setIsConnected(false)
      setOnlineUsers({})
      return
    }

    console.log('Setting up presence channel for user:', currentUser.user_id)

    // Create presence channel
    const channel = supabaseRef.current.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: currentUser.user_id,
        },
      },
    })

    // Handle presence sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: Record<string, UserPresence> = {}
        
        Object.entries(state).forEach(([key, presences]) => {
          // Get the most recent presence
          if (Array.isArray(presences) && presences.length > 0) {
            const presence = presences[0] as any
            if (presence && key !== currentUser.user_id) {
              users[key] = presence as UserPresence
            }
          }
        })
        
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key)
        if (key !== currentUser.user_id && Array.isArray(newPresences) && newPresences.length > 0) {
          const presence = newPresences[0] as any
          setOnlineUsers(prev => ({
            ...prev,
            [key]: presence as UserPresence
          }))
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key)
        setOnlineUsers(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
      })
      .subscribe(async (status, err) => {
        console.log('Presence channel status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Connected to presence channel')
          setIsConnected(true)
          retryCountRef.current = 0 // Reset retry count on successful connection
          
          // Track initial presence with current cursor position
          const initialPresence: UserPresence = {
            user_id: currentUser.user_id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            cursor: currentCursorRef.current,
            typing: currentTypingRef.current,
            lastSeen: new Date().toISOString()
          }
          await channel.track(initialPresence)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to presence channel:', err)
          setIsConnected(false)
          retryConnection()
        } else if (status === 'CLOSED') {
          console.log('Presence channel closed')
          setIsConnected(false)
        } else if (status === 'TIMED_OUT') {
          console.log('Presence channel timed out')
          setIsConnected(false)
          retryConnection()
        }
      })

    channelRef.current = channel

    // Track mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY)
    }

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove)

    // Also send periodic updates to ensure cursor position is synced
    const intervalId = setInterval(() => {
      if (channelRef.current && currentUser.user_id) {
        trackPresence()
      }
    }, 1000) // Send full presence update every second

    // Cleanup
    return () => {
      console.log('Cleaning up presence channel')
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(intervalId)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      updateCursor.cancel()
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [roomId, currentUser.user_id, currentUser.username, currentUser.avatar, trackPresence, retryConnection])

  // Function to update typing state
  const updateTyping = useCallback(async (text: string) => {
    currentTypingRef.current = text
    await trackPresence({ typing: text })
  }, [trackPresence])

  return {
    onlineUsers,
    isConnected,
    updateCursor: updateCursor as (x: number, y: number) => void,
    updateTyping
  }
} 