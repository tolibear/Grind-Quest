'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLeaderboard(page: number = 1, limit: number = 100) {
  const { data, error, isLoading } = useSWR(
    `/api/leaderboard?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  return {
    leaderboard: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  }
} 