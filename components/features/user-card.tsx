'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Twitter, ExternalLink, Users, Heart, MessageCircle, Repeat2, Share } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUserData } from '@/hooks/use-user-data'
import { toast } from 'sonner'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface UserCardProps {
  className?: string
}

const questActions: Record<string, string> = {
  follow: 'https://twitter.com/intent/follow?screen_name=grindcoin',
  post: 'https://twitter.com/intent/tweet?text=Just%20joined%20%40grindcoin%20%24GRIND%20community!%20%F0%9F%9A%80',
  reply: 'https://twitter.com/grindcoin',
  repost: 'https://twitter.com/grindcoin',
  drip_action: '#', // Mock action for DRIP connection
}

// Mock tweet component
function TweetCard({ post, user, onClaimBonus }: { post: any, user: any, onClaimBonus: (postId: string, bonusPoints: number) => void }) {
  const [claimed, setClaimed] = useState(false)
  
  const handleClaim = () => {
    if (!claimed) {
      setClaimed(true)
      const bonusPoints = getBonusPoints(post.bonus_type)
      onClaimBonus(post.id, bonusPoints)
    }
  }

  const getBonusPoints = (bonusType: string) => {
    switch (bonusType) {
      case 'reply': return 25
      case 'repost': return 50
      case 'quote': return 120
      case 'viral': return 500
      default: return 0
    }
  }

  const getBonusIcon = (bonusType: string) => {
    switch (bonusType) {
      case 'reply': return <MessageCircle className="h-3 w-3" />
      case 'repost': return <Repeat2 className="h-3 w-3" />
      case 'quote': return <Share className="h-3 w-3" />
      case 'viral': return <Heart className="h-3 w-3 text-red-500" />
      default: return <Twitter className="h-3 w-3" />
    }
  }

  const getBonusText = (bonusType: string) => {
    switch (bonusType) {
      case 'reply': return 'Got replies!'
      case 'repost': return 'Got reposts!'
      case 'quote': return 'Got quotes!'
      case 'viral': return 'Went viral!'
      default: return 'Posted!'
    }
  }

  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      {/* Tweet Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{user?.name}</span>
            <span className="text-muted-foreground text-sm">@{user?.handle}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {new Date(post.awarded_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tweet Content */}
      <p className="text-sm leading-relaxed">{post.content}</p>

      {/* Tweet Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{Math.floor(Math.random() * 50) + 5}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer">
            <Repeat2 className="h-4 w-4" />
            <span className="text-xs">{Math.floor(Math.random() * 30) + 2}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{Math.floor(Math.random() * 100) + 10}</span>
          </div>
        </div>

        {/* Bonus Points Claim */}
        {post.bonus_type && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getBonusIcon(post.bonus_type)}
              <span className="text-xs text-muted-foreground">{getBonusText(post.bonus_type)}</span>
            </div>
            <Button
              size="sm"
              variant={claimed ? "secondary" : "default"}
              className="h-7 px-3 text-xs"
              onClick={handleClaim}
              disabled={claimed}
            >
              {claimed ? '✅ Claimed' : `+${getBonusPoints(post.bonus_type)} pts`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function UserCard({ className }: UserCardProps) {
  const { isAuthenticated, isLoading: authLoading, login, switchUser, availableUsers, user: authUser } = useAuth()
  const { user, quests, posts, isLoading: dataLoading, mutate, updatePoints } = useUserData()
  const [completingQuest, setCompletingQuest] = useState<string | null>(null)

  const isLoading = authLoading || dataLoading

  const handleQuestClick = async (quest: any) => {
    if (quest.completed || !authUser) return

    // For DRIP actions, handle differently
    if (quest.type === 'drip_action') {
      toast.info('DRIP integration coming soon! 🚀')
      return
    }

    // Open Twitter action
    if (questActions[quest.type]) {
      window.open(questActions[quest.type], '_blank')
    }

    // Mark quest as completing
    setCompletingQuest(quest.id)

    // Wait a bit for user to complete action (simulated)
    setTimeout(async () => {
      try {
        const response = await fetch('/api/quests/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            questId: quest.id,
            twitterId: authUser.id 
          }),
        })

        if (response.ok) {
          const data = await response.json()
          toast.success(data.message || `Quest completed! +${data.points} points 🎉`)
          // Update points immediately in the UI
          updatePoints(data.points)
          mutate() // Refresh user data for quest status
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to complete quest')
        }
      } catch (error) {
        toast.error('Failed to complete quest')
      } finally {
        setCompletingQuest(null)
      }
    }, 2000) // Reduced time for demo
  }

  const handleUserSwitch = async (userId: string) => {
    await switchUser(userId)
    toast.success('Switched user for testing!')
  }

  const handleClaimBonus = (postId: string, bonusPoints: number) => {
    toast.success(`Bonus claimed! +${bonusPoints} points from engagement! 🎉`)
    // Update points immediately in the UI
    updatePoints(bonusPoints)
  }

  if (isLoading) {
    return (
      <Card className={cn('flex flex-col h-full', className)}>
        <CardContent className="flex-1 flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className={cn('flex flex-col items-center justify-center', className)}>
        <CardContent className="text-center space-y-6 p-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Join the Grind</h2>
            <p className="text-muted-foreground text-lg">
              Connect to start earning $GRIND points
            </p>
          </div>
          
          {/* Demo User Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Demo Mode - Select a user to test:</span>
            </div>
            <div className="flex gap-3 justify-center">
              {availableUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => handleUserSwitch(user.id)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>@{user.handle}</span>
                  <Badge variant="outline" className="ml-1">
                    {user.points} pts
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => login()}
          >
            <Twitter className="h-5 w-5" />
            Quick Demo Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardContent className="flex-1 overflow-hidden p-6 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-6">
            {/* Quests */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Daily Quests</h4>
              <div className="space-y-2">
                {quests.map((quest: any) => (
                  <div
                    key={quest.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                      quest.completed && 'bg-primary/10 border-primary/20 cursor-default',
                      completingQuest === quest.id && 'opacity-50'
                    )}
                    onClick={() => handleQuestClick(quest)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        quest.completed ? 'bg-primary' : 'bg-muted'
                      )} />
                      <span className={cn(
                        'text-sm',
                        quest.completed && 'line-through text-muted-foreground'
                      )}>
                        {quest.title}
                      </span>
                      {!quest.completed && quest.type !== 'drip_action' && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                      {quest.type === 'drip_action' && (
                        <Badge variant="secondary" className="text-xs">DRIP</Badge>
                      )}
                    </div>
                    <Badge variant={quest.completed ? 'default' : 'outline'}>
                      {quest.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts Tabs */}
            <Tabs defaultValue="my-posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
                <TabsTrigger value="bonus">Bonus Points</TabsTrigger>
              </TabsList>
              <TabsContent value="my-posts" className="space-y-3">
                {posts.length > 0 ? (
                  posts.map((post: any) => (
                    <TweetCard 
                      key={post.id} 
                      post={post} 
                      user={user} 
                      onClaimBonus={handleClaimBonus}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No posts yet. Start posting about $GRIND to earn points!
                  </p>
                )}
              </TabsContent>
              <TabsContent value="bonus" className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Earn bonus points when your posts get engagement!
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Repeat2 className="h-4 w-4" />
                    <span>Repost: +50 points</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply: +25 points</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Share className="h-4 w-4" />
                    <span>Quote: +120 points</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Viral (1000+ engagements): +500 points</span>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <Badge variant="secondary" className="mb-2">DRIP Integration</Badge>
                    <p className="text-xs text-muted-foreground">
                      Enhanced rewards and social questing coming soon with DRIP!
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="pb-6" /> {/* Bottom padding */}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 