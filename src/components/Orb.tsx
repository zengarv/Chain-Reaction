import { motion } from 'framer-motion';
import React from 'react';

interface OrbProps {
  color: string;
  count: number;
  isUnstable: boolean;
}

const Orb: React.FC<OrbProps> = ({ color, count, isUnstable }) => {
  // Calculate positions for multiple orbs with wider spacing
  const getOrbPositions = (index: number, total: number) => {
    const radius = total === 1 ? 0 : Math.min(30, 15 + total * 3); // Increased spacing
    const angle = (index * 2 * Math.PI) / total + Math.random() * 0.5; // More random angle
    return {
      x: Math.cos(angle) * radius * (0.8 + Math.random() * 0.4), // Random radius variation
      y: Math.sin(angle) * radius * (0.8 + Math.random() * 0.4),
    };
  };

  const orbVariants = {
    idle: (i: number) => ({
      x: getOrbPositions(i, count).x,
      y: getOrbPositions(i, count).y,
      scale: [1, 0.9 + Math.random() * 0.4, 1], // Random scale
      transition: {
        duration: 1.5 + Math.random(), // Random duration
        repeat: Infinity,
        repeatType: "reverse" as const,
        delay: i * 0.1 * Math.random(), // Random delay
        ease: "easeInOut",
      },
    }),
    unstable: (i: number) => ({
      x: getOrbPositions(i, count).x + (Math.random() * 10 - 5),
      y: getOrbPositions(i, count).y + (Math.random() * 10 - 5),
      scale: [1, 1.2 + Math.random() * 0.3, 0.8 + Math.random() * 0.2, 1],
      rotate: [0, 20 + Math.random() * 20, -20 - Math.random() * 20, 0],
      transition: {
        duration: 0.3 + Math.random() * 0.4,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
        delay: i * 0.02 * Math.random(),
      },
    }),
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: color,
            borderRadius: '50%',
            // filter: `blur(2px) brightness(1.3)`, // Glow effect
            boxShadow: `0 0 15px ${color}, 0 0 25px ${color}80`,
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