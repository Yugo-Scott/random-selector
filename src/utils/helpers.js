// 配列をシャッフルするヘルパー関数
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// ランダムな紙吹雪の色を取得
export function getRandomConfettiColor() {
  const colors = [
    '#ffffff',
    '#00ccff',
    '#88ddff',
    '#0099cc',
    '#66bbff',
    '#3399ff',
    '#0077ff',
    '#66ffff',
    '#00A7EA',
    '#E0F7FF',
    '#B3EAFF',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
