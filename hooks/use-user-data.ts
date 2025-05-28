'use client'

import useSWR from 'swr'
import { useAuth } from './use-auth'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useUserData() {
  const { user: authUser } = useAuth()
  
  const { data, error, isLoading, mutate } = useSWR(
    authUser ? `/api/me?twitterId=${authUser.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  // Function to update points locally and trigger refresh
  const updatePoints = (additionalPoints: number) => {
    if (data?.user) {
      // Optimistically update the local data
      const updatedUser = {
        ...data.user,
        points: data.user.points + additionalPoints
      }
      
      // Update the cache optimistically
      mutate({
        ...data,
        user: updatedUser
      }, false)
      
      // Then revalidate from server
      setTimeout(() => mutate(), 1000)
    }
  }

  return {
    user: data?.user,
    quests: data?.quests || [],
    posts: data?.posts || [],
    isLoading,
    error,
    mutate,
    updatePoints
  }
} 