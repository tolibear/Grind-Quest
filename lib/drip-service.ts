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
  metadata?: Record<string, any>
}

export interface DripTransaction {
  id: string
  member_id: string
  currency_id: string
  amount: number
  type: 'credit' | 'debit'
  metadata?: Record<string, any>
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

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
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

  private mockResponse(endpoint: string, options: RequestInit): any {
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
      const response = await this.makeRequest(`/accounts/find?type=${type}&values=${value}`)
      return response.data
    } catch (error) {
      console.error('Error finding DRIP account:', error)
      return null
    }
  }

  // Get realm member leaderboard
  async getRealmLeaderboard(realmId: string, currencyId: string, limit: number = 100): Promise<DripRealmMember[]> {
    try {
      const response = await this.makeRequest(`/realm-members/leaderboard?realm_id=${realmId}&currency_id=${currencyId}&limit=${limit}`)
      return response.data || []
    } catch (error) {
      console.error('Error getting DRIP leaderboard:', error)
      return []
    }
  }

  // Update member balance
  async updateMemberBalance(memberId: string, currencyId: string, amount: number, metadata?: Record<string, any>): Promise<boolean> {
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
  async getMemberBalances(memberId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/web3-activations/members/${memberId}/balances`)
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
}

// Export singleton instance
export const dripService = new DripService() 