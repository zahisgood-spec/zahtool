/* 雲端帳號設定（Firebase）。填入後即啟用登入、註冊與跨裝置同步。
   Firebase 的 web 設定值設計上可公開，資料安全靠 Firestore 安全規則（見 SETUP_ACCOUNT.md）。
   留空則整站維持「僅本機」模式。
   取得方式：Firebase 控制台 → 專案設定 → 一般 → 你的應用程式 → 網頁應用程式 → SDK 設定與配置 */
window.NOVA_CLOUD={
  apiKey:'AIzaSyDoJeMBVSDiJME8qrEiPIVJTSyM3tv4K6c',
  authDomain:'tool-73b1e.firebaseapp.com',
  projectId:'tool-73b1e',
  storageBucket:'tool-73b1e.firebasestorage.app',
  messagingSenderId:'725839637487',
  appId:'1:725839637487:web:b4f4180b65574cd79c241a'
};
