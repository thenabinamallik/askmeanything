'use client'

import React, { useEffect, useRef, useState } from 'react'

function IconLogo({ className, ...props }: React.ComponentProps<'svg'>) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const leftPupil = useRef({ x: 0, y: 0 })
  const rightPupil = useRef({ x: 0, y: 0 })
  const animationId = useRef<number>()

  const lerp = (start: number, end: number, t: number) =>
    start + (end - start) * t

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const [_, setFrame] = useState(0) // just to trigger re-render

  useEffect(() => {
    const maxOffset = 50 // increased for more noticeable movement
    const smooting = 0.1 // increased for more noticeable movement

    const update = () => {
      const center = { x: window.innerWidth / 2, y: window.innerHeight / 3.2 }
      const dx = mouse.x - center.x
      const dy = mouse.y - center.y
      const angle = Math.atan2(dy, dx)

      const targetX = Math.cos(angle) * maxOffset
      const targetY = Math.sin(angle) * maxOffset

      leftPupil.current.x = lerp(leftPupil.current.x, targetX, smooting)
      leftPupil.current.y = lerp(leftPupil.current.y, targetY, smooting)
      rightPupil.current.x = lerp(rightPupil.current.x, targetX, smooting)
      rightPupil.current.y = lerp(rightPupil.current.y, targetY, smooting)

      setFrame(f => f + 1) // trigger re-render

      animationId.current = requestAnimationFrame(update)
    }

    animationId.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationId.current!)
  }, [mouse])

  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1080"
    >
      {/* Purple face */}
      <g transform="matrix(12.94 0 0 12.94 540 540)">
        <circle stroke="black" strokeWidth="2" fill="#A958E8" r="35" />
      </g>

      {/* White eyes */}
      <g transform="matrix(5.67 0 0 5.67 327.28 540)">
        <circle fill="white" r="35" />
      </g>
      <g transform="matrix(5.67 0 0 5.67 751.96 540)">
        <circle fill="white" r="35" />
      </g>

      {/* Black pupils (follow mouse) */}
      <g
        transform={`matrix(3.12 0 0 3.12 ${322.3 + leftPupil.current.x} ${
          539.2 + leftPupil.current.y
        })`}
      >
        <circle fill="black" r="35" />
      </g>
      <g
        transform={`matrix(3.12 0 0 3.12 ${753.23 + rightPupil.current.x} ${
          540 + rightPupil.current.y
        })`}
      >
        <circle fill="black" r="35" />
      </g>
    </svg>
  )
}

export { IconLogo }
