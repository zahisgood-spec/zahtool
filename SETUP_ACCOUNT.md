# 帳號系統設定（Firebase，約 10 分鐘）

這個網站是純靜態，帳號由 Firebase Authentication 提供，雲端資料存在 Firestore。
設定完成前，網站維持「僅本機」模式，一切照常運作。

1. 到 https://console.firebase.google.com 開啟你的專案（或新建一個）。
2. **註冊網頁應用程式**：專案設定 → 一般 → 你的應用程式 → 新增應用程式 → 網頁（`</>`）。取得 SDK 設定後，把 `apiKey`、`authDomain`、`projectId`、`appId` 貼進 `assets/nova-config.js`。
3. **啟用登入方式**：Authentication → 登入方式 → 啟用「電子郵件/密碼」；要 Google 登入就再啟用「Google」。
4. **授權網域**：Authentication → 設定 → 授權網域，加入你網站的網域（`localhost` 預設已授權）。
5. **建立 Firestore**：Firestore Database → 建立資料庫（正式版模式即可），然後到「規則」貼上：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userSettings/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. 必須用 http(s) 開啟網站（例如 `python3 -m http.server`），用 file:// 開啟無法登入。

## 同步規則
- 同步內容：主控台設定與使用統計（存在 `userSettings/{uid}` 一份文件），不含你在工具裡輸入的文字。
- 以「最後修改時間」為準，整份設定較新者覆蓋較舊者（last-write-wins）。
- 安全規則確保每位使用者只能讀寫自己的文件。
- Firebase 的 web 設定值可以公開，真正的保護是上面的安全規則，請務必貼上。

## 說明
- 註冊後會寄一封驗證信，但不驗證也能使用；若要強制驗證，需在程式裡加判斷。
- 忘記密碼使用 Firebase 內建的重設信與頁面，信件樣板可在 Authentication → 範本 修改。

## 尚未包含
- 刪除帳號與資料（可用 Firebase 的「Delete User Data」擴充功能，或自行寫 Cloud Function）。
