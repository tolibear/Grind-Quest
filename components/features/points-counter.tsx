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
    const duration = 1000 // 1 second animation
    const steps = 30
    const increment = (value - displayValue) / steps
    let current = displayValue
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      
      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className={cn('tabular-nums', className)}>
      {displayValue.toLocaleString()}
    </span>
  )
} 