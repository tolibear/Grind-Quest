'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { UserPlus } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  handle: string
  name?: string
  avatar: string
  points: number
  rank: number
  isCurrentUser?: boolean
}

interface LeaderboardCardProps {
  className?: string
}

export function LeaderboardCard({ className }: LeaderboardCardProps) {
  const { leaderboard, isLoading, error } = useLeaderboard(1, 20) // Limit to 20 users

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-lg">🥇</span>
      case 2:
        return <span className="text-lg">🥈</span>
      case 3:
        return <span className="text-lg">🥉</span>
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>
    }
  }

  const handleFollowClick = (handle: string, event: React.MouseEvent) => {
    event.stopPropagation()
    // Use Twitter follow intent URL as per X Developer documentation
    const cleanHandle = handle.replace('@', '')
    const followUrl = `https://twitter.com/intent/follow?screen_name=${cleanHandle}`
    window.open(followUrl, '_blank', 'width=550,height=420')
  }

  const handleUserClick = (handle: string) => {
    // Open Twitter profile in new tab
    const cleanHandle = handle.replace('@', '')
    window.open(`https://twitter.com/${cleanHandle}`, '_blank')
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
        <CardDescription>Top 20 $GRIND earners</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <ScrollArea className="h-full px-6">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="h-16">
                    <TableCell>
                      <Skeleton className="h-6 w-12" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow className="h-16">
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Failed to load leaderboard
                  </TableCell>
                </TableRow>
              ) : leaderboard.length === 0 ? (
                <TableRow className="h-16">
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No players yet
                  </TableCell>
                </TableRow>
              ) : (
                leaderboard.map((player: LeaderboardEntry) => (
                  <TableRow
                    key={player.id}
                    className={cn(
                      'h-16 transition-colors group',
                      player.isCurrentUser && 'bg-primary/10 hover:bg-primary/20'
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankDisplay(player.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleUserClick(player.handle)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={player.avatar} 
                              alt={player.name || player.handle}
                            />
                            <AvatarFallback>
                              {player.name?.slice(0, 2).toUpperCase() || player.handle?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <a 
                            href={`https://twitter.com/${player.handle?.replace('@', '') || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'font-medium hover:text-primary transition-colors',
                              player.isCurrentUser && 'text-primary'
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{player.handle || 'unknown'}
                          </a>
                        </div>
                        
                        {/* Follow Button - appears on hover */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-3 text-xs"
                          onClick={(e) => handleFollowClick(player.handle, e)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-bold text-accent">
                          ✨ {player.points.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium">pts</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="pb-6" /> {/* Bottom padding */}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 