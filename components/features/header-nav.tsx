'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Twitter } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUserData } from '@/hooks/use-user-data'
import { PointsCounter } from '@/components/features/points-counter'
import { toast } from 'sonner'

export function HeaderNav() {
  const { isAuthenticated, isLoading: authLoading, login, logout, switchUser, availableUsers, user: authUser } = useAuth()
  const { user, isLoading: dataLoading } = useUserData()

  const isLoading = authLoading || dataLoading

  const handleUserSwitch = async (userId: string) => {
    await switchUser(userId)
    toast.success('Switched user for testing!')
  }

  if (isLoading) {
    return (
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Grind Quest</h1>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  if (!isAuthenticated) {
    return (
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Grind Quest</h1>
              <Badge variant="outline" className="text-xs">
                Demo Mode
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {/* Demo User Selector */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Select user:</span>
              </div>
              <div className="flex gap-2">
                {availableUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleUserSwitch(user.id)}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span>@{user.handle}</span>
                  </Button>
                ))}
              </div>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => login()}
              >
                <Twitter className="h-4 w-4" />
                Demo Login
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Grind Quest</h1>
            <Badge variant="outline" className="text-xs">
              Demo Mode
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Points Display */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">✨ Points</p>
                <p className="text-lg font-bold text-primary">
                  <PointsCounter value={user?.points || 0} />
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="text-lg font-bold">
                  {user?.rank > 0 ? `#${user.rank}` : 'Unranked'}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'GU'}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || 'Grind User'}</p>
                <p className="text-xs text-muted-foreground">@{user?.handle || 'user'}</p>
              </div>
            </div>

            {/* User Switcher for Demo */}
            <div className="flex gap-1">
              {availableUsers.map((demoUser) => (
                <Button
                  key={demoUser.id}
                  variant={authUser?.id === demoUser.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-2"
                  onClick={() => handleUserSwitch(demoUser.id)}
                >
                  @{demoUser.handle}
                </Button>
              ))}
            </div>

            {/* Disconnect Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 