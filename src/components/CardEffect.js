import React from 'react';

// カードエフェクト
const CardEffect = ({ isResult }) => {
  return (
    <>
      {/* 背景キラキラ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(isResult ? 15 : 5)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className={`
              absolute rounded-full bg-white
              ${isResult ? 'sparkle-shine' : 'sparkle-float'}
            `}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              opacity: 0.1 + Math.random() * 0.6,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 結果表示時の特殊エフェクト */}
      {isResult && (
        <>
          {/* キラキラ光る装飾 */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rotate-12 bg-gradient-to-br from-yellow-300/40 to-transparent rounded-full blur-md"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 rotate-45 bg-gradient-to-tl from-cyan-300/30 to-transparent rounded-full blur-md"></div>

          {/* 光の線 */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        </>
      )}
    </>
  );
};

export default CardEffect;
