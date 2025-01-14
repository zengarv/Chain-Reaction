import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

interface OrbProps {
  color: string;
  count: number;
  isUnstable: boolean;
  cellSize: number;
}

const Orb: React.FC<OrbProps> = ({ color, count, isUnstable, cellSize }) => {
  // More aggressive size reduction for smaller cells
  const orbSize = useMemo(() => {
    // Base size calculation
    const baseSize = cellSize / 5; // Start with 20% of cell size
    
    // Progressive size reduction for smaller cells
    let adjustedSize;
    if (cellSize < 30) {
      adjustedSize = baseSize * 0.6; // 60% of base size for very small cells
    } else if (cellSize < 40) {
      adjustedSize = baseSize * 0.75; // 75% of base size for small cells
    } else {
      adjustedSize = baseSize; // Full size for normal cells
    }
    
    // Enforce min and max sizes
    const finalSize = Math.max(4, Math.min(16, adjustedSize));
    return Math.round(finalSize);
  }, [cellSize]);

  // Adjust orbit radius based on cell and orb size
  const getOrbPositions = (index: number, total: number) => {
    const maxRadius = (cellSize - orbSize) / 3; // Ensure orbs don't touch edges
    const radius = total === 1 ? 0 : Math.min(maxRadius, maxRadius * 0.8);
    const angle = (index * 2 * Math.PI) / total + Math.random() * 0.3;
    return {
      x: Math.cos(angle) * radius * (0.8 + Math.random() * 0.2),
      y: Math.sin(angle) * radius * (0.8 + Math.random() * 0.2),
    };
  };

  const orbVariants = {
    idle: (i: number) => ({
      x: getOrbPositions(i, count).x,
      y: getOrbPositions(i, count).y,
      scale: [1, 0.95 + Math.random() * 0.15, 1], // Reduced scale variation
      transition: {
        duration: 1.2 + Math.random() * 0.3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        delay: i * 0.1 * Math.random(),
        ease: "easeInOut",
      },
    }),
    unstable: (i: number) => ({
      x: getOrbPositions(i, count).x + (Math.random() * cellSize * 0.03), // Reduced jitter
      y: getOrbPositions(i, count).y + (Math.random() * cellSize * 0.03),
      scale: [1, 1.1 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 1],
      rotate: [0, 10 + Math.random() * 10, -10 - Math.random() * 10, 0],
      transition: {
        duration: 0.2 + Math.random() * 0.2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: i * 0.02 * Math.random(),
      },
    }),
  };

  // Adjust shadow size for smaller orbs
  const shadowSize = Math.max(3, orbSize * 0.6); // Reduced shadow for smaller orbs

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: `${orbSize}px`,
            height: `${orbSize}px`,
            backgroundColor: color,
            borderRadius: '50%',
            boxShadow: `0 0 ${shadowSize}px ${color}, 0 0 ${shadowSize * 1.5}px ${color}80`,
          }}
          variants={orbVariants}
          animate={isUnstable ? 'unstable' : 'idle'}
          custom={index}
        />
      ))}
    </div>
  );
};

export default Orb;