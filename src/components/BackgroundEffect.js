import React from 'react';

// 背景エフェクト
const BackgroundEffect = ({ activeEffects }) => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* 動的な背景パターン */}
      <div className="absolute inset-0 bg-pattern opacity-10"></div>

      {/* 波紋エフェクト - 常に表示 */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={`ripple-${i}`}
            className="absolute rounded-full border border-white/10 ripple-effect"
            style={{
              left: '50%',
              top: '50%',
              width: `${(i + 1) * 20}%`,
              height: `${(i + 1) * 20}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* バブルエフェクト */}
      {activeEffects.bubbles && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-white/20 bubble-float"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-50px`,
                width: `${10 + Math.random() * 30}px`,
                height: `${10 + Math.random() * 30}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 渦巻きエフェクト */}
      {activeEffects.vortex && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="vortex-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={`vortex-${i}`}
                className="absolute rounded-full border-4 border-white/5 vortex-ring"
                style={{
                  width: `${(i + 1) * 30}%`,
                  height: `${(i + 1) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${4 - i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* スポットライトエフェクト */}
      {activeEffects.spotlight && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-full max-w-4xl h-80 spotlight-effect"></div>
        </div>
      )}

      {/* グラデーションオーバーレイ - 常に表示 */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-cyan-400/20" />
    </div>
  );
};

export default BackgroundEffect;
