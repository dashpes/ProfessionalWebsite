import { useState, useEffect } from 'react'

export function useCounterAnimation(target: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start || target === 0) {
      setCount(target)
      return
    }

    let startTime: number | null = null
    const startValue = 0

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentCount = Math.floor(startValue + (target - startValue) * easeOutCubic)
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target) // Ensure we end exactly on target
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, start])

  return count
}