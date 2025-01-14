import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

interface OrbProps {
  color: string;
  count: number;
  isUnstable: boolean;
  cellSize: number;
}

const Orb: React.FC<OrbProps> = ({ color, count, isUnstable, cellSize }) => {
  // Calculate base orb size based on cell size
  const orbSize = useMemo(() => {
    const baseSize = Math.max(8, Math.min(16, cellSize / 4));
    return Math.round(baseSize);
  }, [cellSize]);

  // Calculate animation radius based on cell size
  const getOrbPositions = (index: number, total: number) => {
    const maxRadius = cellSize / 3;
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
      scale: [1, 0.95 + Math.random() * 0.2, 1],
      transition: {
        duration: 1.2 + Math.random() * 0.3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        delay: i * 0.1 * Math.random(),
        ease: "easeInOut",
      },
    }),
    unstable: (i: number) => ({
      x: getOrbPositions(i, count).x + (Math.random() * cellSize * 0.05),
      y: getOrbPositions(i, count).y + (Math.random() * cellSize * 0.05),
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

  // Calculate shadow size based on orb size
  const shadowSize = Math.max(5, orbSize * 0.8);

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