// DRIP API Integration Service
// Based on DRIP API documentation: https://docs.drip.re/api-reference

export interface DripAccount {
  id: string
  twitter_id?: string
  discord_id?: string
  wallet?: string
  email?: string
  username?: string
}

export interface DripRealmMember {
  id: string
  account_id: string
  realm_id: string
  balance: number
  currency_id: string
}

export interface DripCurrency {
  id: string
  name: string
  symbol: string
  metadata?: Record<string, unknown>
}

export interface DripTransaction {
  id: string
  member_id: string
  currency_id: string
  amount: number
  type: 'credit' | 'debit'
  metadata?: Record<string, unknown>
}

// Mock DRIP service for integration preparation
// This will be replaced with actual DRIP API integration

interface DripUser {
  id: string
  twitter_id: string
  drip_id?: string
  points: number
  level: number
  achievements: string[]
}

interface DripQuest {
  id: string
  type: string
  title: string
  description: string
  points: number
  requirements: Record<string, unknown>
}

interface DripActivity {
  id: string
  user_id: string
  type: string
  points: number
  metadata: Record<string, unknown>
  timestamp: string
}

export class DripService {
  private apiKey: string
  private baseUrl: string
  private mockMode: boolean

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.DRIP_API_KEY || 'mock-api-key'
    this.baseUrl = baseUrl || process.env.DRIP_API_URL || 'https://api.drip.re/api/v1'
    this.mockMode = this.apiKey === 'mock-api-key'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    if (this.mockMode) {
      return this.mockResponse(endpoint, options)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`DRIP API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private mockResponse(endpoint: string, options: RequestInit): unknown {
    console.log(`[MOCK DRIP] ${options.method || 'GET'} ${endpoint}`)
    
    // Mock responses based on endpoint
    if (endpoint.includes('/accounts/find')) {
      return {
        data: {
          id: 'mock-account-123',
          twitter_id: 'mock_user_1',
          username: 'grindmaster'
        }
      }
    }
    
    if (endpoint.includes('/realm-members')) {
      return {
        data: [
          {
            id: 'mock-member-123',
            account_id: 'mock-account-123',
            realm_id: 'grind-realm',
            balance: 2500,
            currency_id: 'grind-points'
          }
        ]
      }
    }

    return { data: null }
  }

  // Find account by various identifiers
  async findAccount(type: 'twitter-id' | 'discord-id' | 'wallet' | 'email' | 'username', value: string): Promise<DripAccount | null> {
    try {
      const response = await this.makeRequest(`/accounts/find?type=${type}&values=${value}`) as { data: DripAccount | null }
      return response.data
    } catch (error) {
      console.error('Error finding DRIP account:', error)
      return null
    }
  }

  // Get realm member leaderboard
  async getRealmLeaderboard(realmId: string, currencyId: string, limit: number = 100): Promise<DripRealmMember[]> {
    try {
      const response = await this.makeRequest(`/realm-members/leaderboard?realm_id=${realmId}&currency_id=${currencyId}&limit=${limit}`) as { data: DripRealmMember[] | null }
      return response.data || []
    } catch (error) {
      console.error('Error getting DRIP leaderboard:', error)
      return []
    }
  }

  // Update member balance
  async updateMemberBalance(memberId: string, currencyId: string, amount: number, metadata?: Record<string, unknown>): Promise<boolean> {
    try {
      await this.makeRequest(`/realm-members/${memberId}/balance`, {
        method: 'PATCH',
        body: JSON.stringify({
          currency_id: currencyId,
          amount,
          metadata
        })
      })
      return true
    } catch (error) {
      console.error('Error updating DRIP balance:', error)
      return false
    }
  }

  // Transfer balance between members
  async transferBalance(fromMemberId: string, toMemberId: string, currencyId: string, amount: number): Promise<boolean> {
    try {
      await this.makeRequest(`/realm-members/${fromMemberId}/transfer`, {
        method: 'PATCH',
        body: JSON.stringify({
          to_member_id: toMemberId,
          currency_id: currencyId,
          amount
        })
      })
      return true
    } catch (error) {
      console.error('Error transferring DRIP balance:', error)
      return false
    }
  }

  // Get member balance data
  async getMemberBalances(memberId: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await this.makeRequest(`/web3-activations/members/${memberId}/balances`) as { data: Record<string, unknown> | null }
      return response.data
    } catch (error) {
      console.error('Error getting member balances:', error)
      return null
    }
  }

  // Sync user data with DRIP
  async syncUserWithDrip(twitterId: string, handle: string, points: number): Promise<{
    account?: DripAccount
    member?: DripRealmMember
    synced: boolean
  }> {
    try {
      // Find or create account
      let account = await this.findAccount('twitter-id', twitterId)
      
      if (!account) {
        // In a real implementation, you'd create the account
        console.log(`[DRIP] Would create account for ${handle}`)
        account = {
          id: `mock-account-${twitterId}`,
          twitter_id: twitterId,
          username: handle
        }
      }

      // Update points in DRIP
      if (this.mockMode) {
        console.log(`[MOCK DRIP] Would sync ${points} points for ${handle}`)
      }

      return {
        account,
        synced: true
      }
    } catch (error) {
      console.error('Error syncing with DRIP:', error)
      return { synced: false }
    }
  }

  // Connect a Twitter user to DRIP
  async connectUser(twitterId: string, twitterHandle: string): Promise<DripUser> {
    // Mock implementation
    console.log(`[DRIP] Connecting user: ${twitterHandle} (${twitterId})`)
    
    return {
      id: `drip_${twitterId}`,
      twitter_id: twitterId,
      drip_id: `drip_${twitterId}`,
      points: 0,
      level: 1,
      achievements: []
    }
  }

  // Get available quests from DRIP
  async getQuests(userId: string): Promise<DripQuest[]> {
    // Mock implementation
    console.log(`[DRIP] Fetching quests for user: ${userId}`)
    
    return [
      {
        id: 'drip_quest_1',
        type: 'social_share',
        title: 'Share on DRIP',
        description: 'Share your $GRIND journey on DRIP',
        points: 150,
        requirements: { platform: 'drip' }
      },
      {
        id: 'drip_quest_2',
        type: 'community_engage',
        title: 'Join DRIP Community',
        description: 'Participate in DRIP community activities',
        points: 200,
        requirements: { action: 'join_community' }
      }
    ]
  }

  // Submit activity to DRIP
  async submitActivity(userId: string, activity: Omit<DripActivity, 'id' | 'timestamp'>): Promise<DripActivity> {
    // Mock implementation
    console.log(`[DRIP] Submitting activity for user: ${userId}`, activity)
    
    return {
      id: `activity_${Date.now()}`,
      user_id: userId,
      type: activity.type,
      points: activity.points,
      metadata: activity.metadata,
      timestamp: new Date().toISOString()
    }
  }

  // Sync points between platforms
  async syncPoints(userId: string, points: number): Promise<{ success: boolean; synced_points: number }> {
    // Mock implementation
    console.log(`[DRIP] Syncing ${points} points for user: ${userId}`)
    
    return {
      success: true,
      synced_points: points
    }
  }

  // Get user's DRIP profile
  async getUserProfile(userId: string): Promise<DripUser | null> {
    // Mock implementation
    console.log(`[DRIP] Fetching profile for user: ${userId}`)
    
    // Simulate not found for some users
    if (Math.random() > 0.5) {
      return null
    }
    
    return {
      id: userId,
      twitter_id: userId.replace('drip_', ''),
      drip_id: userId,
      points: Math.floor(Math.random() * 1000),
      level: Math.floor(Math.random() * 10) + 1,
      achievements: ['early_adopter', 'social_butterfly']
    }
  }

  // Verify quest completion
  async verifyQuestCompletion(userId: string, questId: string): Promise<{ completed: boolean; points_awarded: number }> {
    // Mock implementation
    console.log(`[DRIP] Verifying quest ${questId} for user: ${userId}`)
    
    // Simulate random completion
    const completed = Math.random() > 0.3
    
    return {
      completed,
      points_awarded: completed ? 150 : 0
    }
  }

  // Get leaderboard from DRIP
  async getLeaderboard(limit: number = 100): Promise<Array<DripUser & { rank: number }>> {
    // Mock implementation
    console.log(`[DRIP] Fetching leaderboard (limit: ${limit})`)
    
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `drip_user_${i}`,
      twitter_id: `twitter_${i}`,
      drip_id: `drip_user_${i}`,
      points: 1000 - (i * 100),
      level: 10 - i,
      achievements: ['top_grinder'],
      rank: i + 1
    }))
  }

  // Log activity for analytics
  async logActivity(event: string, data: Record<string, unknown>): Promise<void> {
    // Mock implementation
    console.log(`[DRIP Analytics] ${event}:`, data)
  }
}

// Export singleton instance
export const dripService = new DripService() 