import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dripService } from '@/lib/drip-service'

export async function POST(request: NextRequest) {
  try {
    const { questId, twitterId } = await request.json()

    if (!questId || !twitterId) {
      return NextResponse.json({ error: 'Quest ID and Twitter ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('twitter_id', twitterId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get quest
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Check if already completed
    const { data: existing } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', user.id)
      .eq('quest_id', questId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 })
    }

    // For mock testing, we'll trust the client
    // In production, verify quest completion with Twitter API or DRIP

    // Mark quest as completed
    const { error: completeError } = await supabase
      .from('user_quests')
      .insert({
        user_id: user.id,
        quest_id: questId
      })

    if (completeError) throw completeError

    // Update user points
    const newPoints = user.points + quest.points
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Sync with DRIP (mock for now)
    try {
      await dripService.syncUserWithDrip(twitterId, user.handle, newPoints)
      
      // Log DRIP sync
      await supabase
        .from('drip_sync_log')
        .insert({
          user_id: user.id,
          action_type: 'quest_complete',
          drip_response: { quest_id: questId, points: quest.points },
          success: true
        })
    } catch (dripError) {
      console.error('DRIP sync error:', dripError)
      // Don't fail the quest completion if DRIP sync fails
    }

    return NextResponse.json({
      success: true,
      points: quest.points,
      totalPoints: newPoints,
      message: `Quest completed! +${quest.points} points earned.`
    })
  } catch (error) {
    console.error('Error in /api/quests/complete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 