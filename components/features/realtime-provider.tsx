'use client'

import { usePresence } from '@/hooks/usePresence'
import { useChat } from '@/hooks/useChat'
import { FloatingCursors } from './floating-cursors'
import { CursorChat } from './cursor-chat'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RealtimeProviderProps {
  user: {
    id: string
    handle: string
    name: string
    avatar: string
    points: number
    rank: number
  } | null
  children: React.ReactNode
}

export function RealtimeProvider({ user, children }: RealtimeProviderProps) {
  const [supabaseStatus, setSupabaseStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [recentMessages, setRecentMessages] = useState<Array<{
    user_id: string
    message: string
    timestamp: string
  }>>([])
  const [currentUserTyping, setCurrentUserTyping] = useState<string>('')

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('users').select('count').limit(1)
        
        if (error) {
          console.error('Supabase connection error:', error)
          setSupabaseStatus('failed')
        } else {
          console.log('Supabase connection successful')
          setSupabaseStatus('connected')
        }
      } catch (err) {
        console.error('Supabase connection failed:', err)
        setSupabaseStatus('failed')
      }
    }

    testConnection()
  }, [])

  // Only enable realtime features if user is logged in and Supabase is connected
  const presenceUser = user && supabaseStatus === 'connected' ? {
    user_id: user.id,
    username: user.handle, // Map handle to username
    avatar: user.avatar
  } : null

  const { onlineUsers, updateTyping } = usePresence(
    presenceUser || { user_id: '', username: '', avatar: '' },
    { roomId: 'main' }
  )

  const { messages, sendMessage } = useChat(
    user && supabaseStatus === 'connected' ? { id: user.id, username: user.handle, avatar: user.avatar } : { id: '', username: '', avatar: '' },
    { roomId: 'main' }
  )

  // Track recent messages for transient display
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      console.log('New message received:', latestMessage)
      
      setRecentMessages(prev => {
        // Keep only the last 5 messages for performance
        const updated = [...prev, {
          user_id: latestMessage.user_id,
          message: latestMessage.message,
          timestamp: latestMessage.timestamp
        }]
        return updated.slice(-5)
      })
    }
  }, [messages])

  // Handle typing updates
  const handleTyping = (text: string) => {
    setCurrentUserTyping(text)
    updateTyping(text)
  }

  // Don't render realtime components if no user
  if (!user) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      
      {/* Enhanced debug info - commented out for production */}
      {/* <div className="fixed top-20 left-6 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs space-y-1">
        <div>User: {user.handle}</div>
        <div>Supabase: {supabaseStatus === 'testing' ? '🔄' : supabaseStatus === 'connected' ? '✅' : '❌'}</div>
        <div>Presence: {presenceConnected ? '✅' : '❌'}</div>
        <div>Chat: {chatConnected ? '✅' : '❌'}</div>
        <div>Online: {Object.keys(onlineUsers).length}</div>
        <div>Cursor: {lastCursorUpdate}</div>
        <div className="text-[10px] opacity-70">
          {Object.entries(onlineUsers).map(([id, u]) => (
            <div key={id}>
              {u.username}: {u.cursor.x},{u.cursor.y}
            </div>
          ))}
        </div>
      </div> */}
      
      <FloatingCursors 
        users={onlineUsers} 
        currentUserId={user.id}
        currentUserTyping={currentUserTyping}
        recentMessages={recentMessages}
      />
      <CursorChat
        onSendMessage={sendMessage}
        onTyping={handleTyping}
      />
    </>
  )
} 