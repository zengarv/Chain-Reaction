import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerProps {
  timeLeft: number;
  isActive: boolean;
  currentPlayerName: string;
  totalDuration?: number; // Total timer duration for percentage calculation
}

const Timer: React.FC<TimerProps> = ({ timeLeft, isActive, currentPlayerName, totalDuration = 20 }) => {
  if (!isActive) return null;

  const isUrgent = timeLeft <= 5;
  const percentage = Math.max(0, (timeLeft / totalDuration) * 100);

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
        isUrgent 
          ? 'border-red-500 bg-red-500/10' 
          : 'border-purple-500 bg-purple-500/10'
      }`}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
    >
      <motion.div
        className={`p-2 rounded-full ${
          isUrgent ? 'bg-red-500' : 'bg-purple-500'
        }`}
        animate={isUrgent ? { rotate: [0, 10, -10, 0] } : {}}
        transition={isUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
      >
        <Clock className="w-4 h-4 text-white" />
      </motion.div>
      
      <div className="flex-1">
        <div className={`text-sm font-medium ${
          isUrgent ? 'text-red-300' : 'text-purple-300'
        }`}>
          {currentPlayerName}'s Turn
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isUrgent ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${percentage}%` }}
              initial={{ width: '100%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.span
            className={`text-lg font-bold ${
              isUrgent ? 'text-red-400' : 'text-purple-400'
            }`}
            animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
            transition={isUrgent ? { repeat: Infinity, duration: 1 } : {}}
          >
            {timeLeft}s
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Timer;
