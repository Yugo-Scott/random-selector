import React from 'react';
import { getRandomConfettiColor } from '../utils/helpers';

// 紙吹雪エフェクト
const ConfettiEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {[...Array(150)].map((_, i) => {
        const isSquare = Math.random() > 0.5;
        return (
          <div
            key={`confetti-${i}`}
            className={`absolute confetti ${
              isSquare ? 'square-confetti' : 'round-confetti'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              width: `${5 + Math.random() * 7}px`,
              height: isSquare
                ? `${5 + Math.random() * 7}px`
                : `${10 + Math.random() * 15}px`,
              backgroundColor: getRandomConfettiColor(),
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ConfettiEffect;
