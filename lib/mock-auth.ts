'use client'

// Mock authentication for testing without Twitter OAuth
export interface MockUser {
  id: string
  handle: string
  name: string
  avatar: string
  points: number
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'mock_user_1',
    handle: 'grindmaster',
    name: 'Grind Master',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grindmaster',
    points: 3250
  },
  {
    id: 'mock_user_2',
    handle: 'newbie',
    name: 'Grind Newbie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie',
    points: 150
  }
]

export class MockAuth {
  private static currentUser: MockUser | null = null

  static getCurrentUser(): MockUser | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem('mock_current_user')
    if (stored) {
      this.currentUser = JSON.parse(stored)
    }
    return this.currentUser
  }

  static login(userId: string): MockUser | null {
    const user = MOCK_USERS.find(u => u.id === userId)
    if (user) {
      this.currentUser = user
      localStorage.setItem('mock_current_user', JSON.stringify(user))
      return user
    }
    return null
  }

  static logout(): void {
    this.currentUser = null
    localStorage.removeItem('mock_current_user')
  }

  static getAvailableUsers(): MockUser[] {
    return MOCK_USERS
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
} 