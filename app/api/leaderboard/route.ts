import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit

    const supabase = await createClient()
    const session = await getServerSession()

    // Get leaderboard data
    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('points', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Add rank to each user
    const leaderboard = users?.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
      isCurrentUser: session?.user?.id === user.twitter_id
    })) || []

    return NextResponse.json({
      data: leaderboard,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in /api/leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 