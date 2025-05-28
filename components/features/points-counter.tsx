'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PointsCounterProps {
  value: number
  className?: string
}

export function PointsCounter({ value, className }: PointsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value)
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <span className={cn('tabular-nums', className)}>
      {displayValue.toLocaleString()}
    </span>
  )
} 