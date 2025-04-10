import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { shuffleArray } from '../utils/helpers';
import BackgroundEffect from './BackgroundEffect';
import CardEffect from './CardEffect';
import ConfettiEffect from './ConfettiEffect';

// メインアプリケーションコンポーネント
const EnhancedVisualPicker = () => {
  // サンプルデータ（実際の実装ではFirestoreから取得）
  const [peopleList, setPeopleList] = useState([
    { id: '1', location: '東京', department: 'Lab15期', name: '田中太郎' },
    { id: '2', location: '福岡', department: 'Dev25期', name: '鈴木花子' },
    { id: '3', location: '札幌', department: 'Lab15期', name: '佐藤一郎' },
    { id: '4', location: '東京', department: 'Dev25期', name: '山田優子' },
    { id: '5', location: '福岡', department: 'Lab15期', name: '伊藤誠' },
    { id: '6', location: '札幌', department: 'Dev25期', name: '高橋実' },
    { id: '7', location: '東京', department: 'Lab15期', name: '渡辺裕子' },
    { id: '8', location: '福岡', department: 'Dev25期', name: '小林和夫' },
    { id: '9', location: '札幌', department: 'Lab15期', name: '加藤明' },
    { id: '10', location: '東京', department: 'Dev25期', name: '吉田智子' },
    { id: '11', location: '福岡', department: 'Lab15期', name: '中村健太' },
    { id: '12', location: '札幌', department: 'Dev25期', name: '斎藤美咲' },
  ]);

  // 選択された人の状態管理
  const [selectedPeople, setSelectedPeople] = useState([]);
  // 選択中のアニメーション状態
  const [isSelecting, setIsSelecting] = useState(false);
  // 結果表示の状態
  const [showResults, setShowResults] = useState(false);
  // 選択済みのIDを記録
  const [usedIds, setUsedIds] = useState(new Set());
  // アニメーションの進行状態（0-100）
  const [animationProgress, setAnimationProgress] = useState(0);
  // アクティブエフェクト
  const [activeEffects, setActiveEffects] = useState({
    bubbles: false,
    vortex: false,
    spotlight: false,
    confetti: false,
  });

  // ランダム選出ロジック
  const selectRandomPeople = () => {
    if (isSelecting) return;

    // アニメーション状態をONに
    setIsSelecting(true);
    setShowResults(false);
    setAnimationProgress(0);

    // エフェクト初期化
    setActiveEffects({
      bubbles: true,
      vortex: false,
      spotlight: false,
      confetti: false,
    });

    // 未使用の名前だけをフィルタリング
    const availablePeople = peopleList.filter(
      (person) => !usedIds.has(person.id)
    );

    // 選択できる人が3人未満の場合はリセット
    if (availablePeople.length < 3) {
      setUsedIds(new Set());
      setTimeout(() => selectRandomPeople(), 300);
      return;
    }

    // シャッフルして最初の3人を選択
    const shuffled = shuffleArray([...availablePeople]);
    const selected = shuffled.slice(0, 3);

    // アニメーションの実行
    const animationDuration = 4000; // 4秒間
    const startTime = Date.now();

    const runAnimation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / animationDuration) * 100);
      setAnimationProgress(progress);

      // 進行状況に応じてエフェクト変更
      if (progress > 30 && progress < 60) {
        setActiveEffects({
          bubbles: true,
          vortex: true,
          spotlight: false,
          confetti: false,
        });
      } else if (progress > 60 && progress < 90) {
        setActiveEffects({
          bubbles: true,
          vortex: true,
          spotlight: true,
          confetti: false,
        });
      }

      // 進行状況に応じて表示する名前を変更
      const availableCopy = [...availablePeople];
      if (progress < 90) {
        // アニメーション中はランダムな名前を表示
        const randomIndex = Math.floor(
          (progress / 90) * (availableCopy.length - 3)
        );
        const speed = Math.ceil(Math.max(1, 10 - progress / 10)); // 徐々に遅くなる

        if (elapsed % speed === 0) {
          const randomSelection = shuffleArray(availableCopy).slice(0, 3);
          setSelectedPeople(randomSelection);
        }
      } else {
        // 最終結果を表示
        setSelectedPeople(selected);

        // 結果確定時のエフェクト
        if (progress > 95 && !activeEffects.confetti) {
          setActiveEffects({
            bubbles: false,
            vortex: false,
            spotlight: true,
            confetti: true,
          });
        }
      }

      // アニメーション継続判定
      if (progress < 100) {
        requestAnimationFrame(runAnimation);
      } else {
        // アニメーション終了処理
        finishSelection(selected);
      }
    };

    // アニメーション開始
    requestAnimationFrame(runAnimation);
  };

  // 選択完了処理
  const finishSelection = (selected) => {
    // 選択された人のIDを記録
    const newUsedIds = new Set(usedIds);
    selected.forEach((person) => newUsedIds.add(person.id));
    setUsedIds(newUsedIds);

    // 結果表示モードに切り替え
    setIsSelecting(false);
    setShowResults(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden relative bg-gradient-to-b from-blue-400 via-cyan-500 to-blue-600">
      {/* ベースとなる背景色 - #00A7EA基調 */}
      <div className="absolute inset-0 bg-[#00A7EA] opacity-70 z-0" />

      {/* 背景エフェクト */}
      <BackgroundEffect activeEffects={activeEffects} />

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-glow tracking-wider">
          ランダム3名選出
        </h1>

        {/* 選択結果表示エリア */}
        <div className="w-full p-4 mb-12 min-h-80 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
            {selectedPeople.map((person, index) => (
              <div key={`${person.id}-${index}`} className="perspective-3d">
                <div
                  className={`
                    relative overflow-hidden rounded-xl flex flex-col items-center justify-center
                    ${
                      showResults
                        ? 'bg-gradient-to-b from-white/90 to-white/70 shadow-glow result-card-reveal'
                        : 'bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md selecting-card-pulse'
                    }
                    h-64 transform-gpu
                  `}
                  style={{
                    animationDelay: `${index * 0.15}s`,
                  }}
                >
                  {/* カード内のエフェクト */}
                  <CardEffect isResult={showResults} />

                  {/* 情報表示 */}
                  <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center z-10">
                    {/* 場所 */}
                    <div
                      className={`
                      relative mb-3 px-5 py-1 rounded-full 
                      ${
                        showResults
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold location-badge'
                          : 'bg-white/10 text-blue-100'
                      }
                      ${isSelecting ? 'animate-pulse' : ''}
                    `}
                    >
                      <span className="text-lg tracking-wider relative z-10">
                        {person.location}
                      </span>
                      {showResults && (
                        <div className="absolute inset-0 rounded-full glow-badge"></div>
                      )}
                    </div>

                    {/* 所属 */}
                    <div
                      className={`
                      text-xl md:text-2xl font-bold mb-4
                      ${
                        showResults
                          ? 'text-blue-700 department-reveal'
                          : 'text-blue-100'
                      }
                      ${isSelecting ? 'animate-pulse' : ''}
                    `}
                      style={{ animationDelay: `${index * 0.15 + 0.3}s` }}
                    >
                      {person.department}
                    </div>

                    {/* 名前 */}
                    <div
                      className={`
                      text-2xl md:text-3xl font-bold relative
                      ${
                        showResults
                          ? 'text-blue-900 name-highlight'
                          : 'text-white'
                      }
                      ${isSelecting ? 'animate-pulse' : ''}
                    `}
                      style={{ animationDelay: `${index * 0.15 + 0.6}s` }}
                    >
                      {person.name}
                      {showResults && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent name-underline"></div>
                      )}
                    </div>
                  </div>

                  {/* 選択中の装飾 */}
                  {isSelecting && (
                    <div className="absolute inset-0 border-2 border-white/30 rounded-xl selecting-border"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 選択ボタン */}
        <div className="flex justify-center">
          <button
            onClick={selectRandomPeople}
            disabled={isSelecting}
            className={`
              relative overflow-hidden px-12 py-6 rounded-full font-bold text-xl
              ${
                isSelecting
                  ? 'bg-blue-300/50 cursor-not-allowed'
                  : 'button-gradient text-white hover:shadow-lg transform hover:scale-105 active:scale-95 transition duration-300'
              }
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-300/30 button-glow"></div>

            {/* 選択中のローディングエフェクト */}
            {isSelecting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-t-white/80 border-r-white/40 border-b-white/20 border-l-white/60 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-cyan-400/80 border-b-transparent border-l-cyan-400/80 animate-spin-reverse"></div>
                </div>
              </div>
            )}

            <span
              className={`flex items-center ${isSelecting ? 'opacity-0' : ''}`}
            >
              <Sparkles className="mr-3" size={28} />
              {isSelecting ? '選出中...' : '3名をランダム選出'}
            </span>
          </button>
        </div>

        {/* 進行状況バー（デバッグ用、実際には非表示に） */}
        {isSelecting && false && (
          <div className="w-full max-w-md mx-auto mt-10 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${animationProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* 結果エフェクト */}
      {activeEffects.confetti && <ConfettiEffect />}
    </div>
  );
};

export default EnhancedVisualPicker;
