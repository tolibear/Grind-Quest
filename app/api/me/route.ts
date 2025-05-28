import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const twitterId = searchParams.get('twitter_id') || searchParams.get('twitterId')
    
    if (!twitterId) {
      return NextResponse.json({ error: 'Twitter ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('twitter_id', twitterId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's completed quests
    const { data: completedQuests, error: questsError } = await supabase
      .from('user_quests')
      .select('quest_id')
      .eq('user_id', user.id)

    if (questsError) throw questsError

    // Get all quests
    const { data: allQuests, error: allQuestsError } = await supabase
      .from('quests')
      .select('*')
      .eq('active', true)

    if (allQuestsError) throw allQuestsError

    // Mark completed quests
    const questsWithStatus = allQuests.map(quest => ({
      ...quest,
      completed: completedQuests?.some(cq => cq.quest_id === quest.id) || false
    }))

    // Get user's posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: false })
      .limit(10)

    if (postsError) throw postsError

    // Get user's rank
    const { data: rankData, error: rankError } = await supabase
      .from('users')
      .select('id')
      .gt('points', user.points)

    if (rankError) throw rankError

    const rank = (rankData?.length || 0) + 1

    return NextResponse.json({
      user: {
        ...user,
        rank
      },
      quests: questsWithStatus,
      posts: posts || []
    })
  } catch (error) {
    console.error('Error in /api/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 