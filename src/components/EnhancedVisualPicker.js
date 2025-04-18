import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { shuffleArray } from '../utils/helpers';
import BackgroundEffect from './BackgroundEffect';
import CardEffect from './CardEffect';
import ConfettiEffect from './ConfettiEffect';

// メインアプリケーションコンポーネント
const EnhancedVisualPicker = () => {
  // 状態管理
  const [peopleList, setPeopleList] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [localUsedIds, setLocalUsedIds] = useState(new Set()); // ローカルで管理する使用済みID
  const [needsSave, setNeedsSave] = useState(false); // 保存が必要かどうかのフラグ
  const [animationProgress, setAnimationProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEffects, setActiveEffects] = useState({
    bubbles: false,
    vortex: false,
    spotlight: false,
    confetti: false,
  });

  // Firestoreからデータを取得する（初回のみ）
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1回のバッチ処理でデータを取得
        const [peopleSnapshot, usedIdsSnapshot] = await Promise.all([
          getDocs(collection(db, 'people')),
          getDoc(doc(db, 'app', 'usedIds')),
        ]);

        if (!isMounted) return;

        // 人物データの処理
        const fetchedPeople = [];
        peopleSnapshot.forEach((doc) => {
          fetchedPeople.push({ id: doc.id, ...doc.data() });
        });
        setPeopleList(fetchedPeople);

        // 使用済みIDの処理
        if (usedIdsSnapshot.exists()) {
          const usedIdsData = usedIdsSnapshot.data();
          setLocalUsedIds(new Set(usedIdsData.ids || []));
        } else {
          // 初回のみ作成
          await setDoc(doc(db, 'app', 'usedIds'), { ids: [] });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError('データの取得中にエラーが発生しました。');
          setLoading(false);
        }
      }
    };

    fetchData();

    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, []);

  // needsSaveフラグが立った時のみFirestoreに保存
  useEffect(() => {
    if (needsSave) {
      saveUsedIds();
      setNeedsSave(false);
    }
  }, [needsSave]);

  // 使用済みIDをFirestoreに保存する
  const saveUsedIds = async () => {
    try {
      const idsArray = Array.from(localUsedIds);
      console.log('保存中: 使用済みID', idsArray);
      await updateDoc(doc(db, 'app', 'usedIds'), {
        ids: idsArray,
      });
    } catch (err) {
      console.error('Error saving used IDs:', err);
    }
  };

  // アプリ終了時に保存するためのイベントリスナー
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localUsedIds.size > 0) {
        // 非同期関数をここで呼ぶことはできないので、同期的なコードで実装
        const idsArray = Array.from(localUsedIds);

        // 'app/usedIds'に保存 (同期的にローカルストレージにも保存しておくと良い)
        try {
          // Navigator.sendBeacon を使用すると良いですが、今回は簡略化
          localStorage.setItem('pendingUsedIds', JSON.stringify(idsArray));
        } catch (e) {
          console.error('Failed to save IDs before unload', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [localUsedIds]);

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
      (person) => !localUsedIds.has(person.id)
    );

    // 選択できる人が3人未満の場合はリセット
    if (availablePeople.length < 3) {
      setLocalUsedIds(new Set());
      setNeedsSave(true); // リセット時は保存フラグを立てる
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
    // 選択された人のIDをローカルで記録
    const newUsedIds = new Set(localUsedIds);
    selected.forEach((person) => newUsedIds.add(person.id));
    setLocalUsedIds(newUsedIds);

    // 3人選出するごとに保存 - 選出数が3の倍数になった時にDBに保存
    if (newUsedIds.size % 3 === 0) {
      setNeedsSave(true);
    }

    // 結果表示モードに切り替え
    setIsSelecting(false);
    setShowResults(true);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-cyan-500 to-blue-600">
        <div className="text-white text-xl">データを読み込み中...</div>
        <div className="mt-4 h-10 w-10 relative">
          <div className="absolute inset-0 rounded-full border-4 border-t-white/80 border-r-white/40 border-b-white/20 border-l-white/60 animate-spin"></div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 via-cyan-500 to-blue-600">
        <div className="text-white text-xl">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white text-blue-500 rounded-lg"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden relative bg-gradient-to-b from-blue-400 via-cyan-500 to-blue-600">
      {/* ベースとなる背景色 - #00A7EA基調 */}
      <div className="absolute inset-0 bg-[#00A7EA] opacity-70 z-0" />

      {/* 背景エフェクト */}
      <BackgroundEffect activeEffects={activeEffects} />

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-glow tracking-wider">
          G's 10th ANNIVERSARY ビンゴ大会
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
                      relative mb-3 px-6 py-2 rounded-full 
                      ${
                        showResults
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold location-badge'
                          : 'bg-white/10 text-blue-100'
                      }
                      ${isSelecting ? 'animate-pulse' : ''}
                    `}
                    >
                      <span className="text-2xl md:text-3xl tracking-wider relative z-10">
                        {person.location}
                      </span>
                      {showResults && (
                        <div className="absolute inset-0 rounded-full glow-badge"></div>
                      )}
                    </div>

                    {/* 所属 */}
                    <div
                      className={`
                      text-3xl md:text-4xl font-bold mb-5
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
                      text-4xl md:text-5xl font-bold relative
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

        {/* 選出済みの人物リスト表示 */}
        <div className="w-full max-w-full mx-auto mt-8 mb-4 px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 overflow-hidden">
            <h3 className="text-center text-3xl text-white font-semibold mb-6 border-b border-white/20 pb-3">
              選出履歴{' '}
              {/* <span className="text-xl font-normal">
                ({localUsedIds.size}人 / 全{peopleList.length}人)
              </span> */}
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3 max-h-96 overflow-y-auto scrollbar-thin px-2">
              {Array.from(localUsedIds).map((id) => {
                const person = peopleList.find((p) => p.id === id);
                return person ? (
                  <div
                    key={id}
                    className="bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-lg px-3 py-2 text-white flex items-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-cyan-300 mr-2 flex-shrink-0"></div>
                    <span className="truncate font-semibold text-base whitespace-normal line-clamp-2">
                      {person.name}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* 進行状況バー（デバッグ用、実際には非表示に） */}
        {/* {isSelecting && false && (
          <div className="w-full max-w-md mx-auto mt-10 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${animationProgress}%` }}
            ></div>
          </div>
        )} */}
      </div>

      {/* 結果エフェクト */}
      {activeEffects.confetti && <ConfettiEffect />}
    </div>
  );
};

export default EnhancedVisualPicker;
