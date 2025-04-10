const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase設定を読み込む（.env.localから、または直接指定）
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// データファイルのパス
const dataFilePath = path.join(__dirname, 'people-data.json');

async function uploadData() {
  try {
    // JSONファイルからデータを読み込む
    const rawData = fs.readFileSync(dataFilePath);
    const peopleData = JSON.parse(rawData);

    console.log(`${peopleData.length}件のデータを読み込みました。`);

    // 既存のデータをクリアする（オプション）
    const shouldClearExisting = process.argv.includes('--clear');
    if (shouldClearExisting) {
      console.log('既存のデータをクリアします...');
      const snapshot = await getDocs(collection(db, 'people'));
      const deletePromises = [];
      snapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, 'people', document.id)));
      });
      await Promise.all(deletePromises);
      console.log('既存のデータをクリアしました。');
    }

    // 新しいデータを追加
    console.log('データをアップロードしています...');
    const uploadPromises = peopleData.map((person) =>
      setDoc(doc(db, 'people', person.id), person)
    );

    await Promise.all(uploadPromises);
    console.log('データのアップロードが完了しました！');

    // 選出済みIDもリセットするオプション
    if (process.argv.includes('--reset-used')) {
      console.log('選出済みIDをリセットします...');
      await setDoc(doc(db, 'app', 'usedIds'), { ids: [] });
      console.log('選出済みIDをリセットしました。');
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    process.exit();
  }
}

uploadData();
