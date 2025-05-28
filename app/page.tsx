import { HeaderNav } from '@/components/features/header-nav'
import { LeaderboardCard } from '@/components/features/leaderboard-card'
import { UserCard } from '@/components/features/user-card'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
          <LeaderboardCard className="w-full md:w-1/2 h-full" />
          <UserCard className="w-full md:w-1/2 h-full" />
        </div>
      </main>
    </div>
  )
}
