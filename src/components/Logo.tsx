import { useState } from 'react';

const logoCandidates = [
  '/src/assets/LOGOP11.png',
  '/src/assets/LOGO.png',
  new URL('../assets/player11-logo.svg', import.meta.url).href,
];

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export default function Player11Logo({
  width = 42,
  height = 42,
  className = '',
  alt = 'Player11',
}: LogoProps) {
  const [logoIndex, setLogoIndex] = useState(0);

  return (
    <img
      src={logoCandidates[logoIndex]}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setLogoIndex((prev) => Math.min(prev + 1, logoCandidates.length - 1))}
      style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', display: 'block' }}
    />
  );
}
