import { useState } from 'react'
import logo from '../assets/LOGOP11.png'

const logoCandidates = [
  logo,
  new URL('../assets/player11-logo.svg', import.meta.url).href,
]

export default function Player11Logo({
  width = 42,
  height = 42,
  className = '',
  alt = 'Player11',
}) {
  const [logoIndex, setLogoIndex] = useState(0)

  return (
    <img
      src={logoCandidates[logoIndex]}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() =>
        setLogoIndex((prev) =>
          Math.min(prev + 1, logoCandidates.length - 1)
        )
      }
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  )
}