'use client'

import { useState, useEffect, useCallback } from 'react'
import { MockAuth, type MockUser } from '@/lib/mock-auth'

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = MockAuth.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (userId?: string) => {
    try {
      // If no userId provided, use the first available user for demo
      const targetUserId = userId || 'mock_user_1'
      const loggedInUser = MockAuth.login(targetUserId)
      setUser(loggedInUser)
      return loggedInUser
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      MockAuth.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const switchUser = useCallback(async (userId: string) => {
    try {
      const newUser = MockAuth.login(userId)
      setUser(newUser)
      return newUser
    } catch (error) {
      console.error('Switch user error:', error)
      return null
    }
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchUser,
    availableUsers: MockAuth.getAvailableUsers(),
  }
} 