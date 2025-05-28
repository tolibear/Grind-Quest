'use client'

import { SessionProvider } from 'next-auth/react'
import { RealtimeProvider } from '@/components/features/realtime-provider'
import { useUserData } from '@/hooks/use-user-data'

function RealtimeWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUserData()
  
  return (
    <RealtimeProvider user={user}>
      {children}
    </RealtimeProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RealtimeWrapper>
        {children}
      </RealtimeWrapper>
    </SessionProvider>
  )
} 