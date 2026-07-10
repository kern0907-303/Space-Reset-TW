# Space Reset｜一鍵建立 Google 表單

Google Forms 沒有穩定的「匯入檔案變成表單」功能，所以這裡用 Apps Script 自動建立。

你要用的檔案：

- `create-space-reset-form-with-telegram.js`

它會自動建立：

- Google 表單：`Space Reset｜空間初步檢視資料上傳`
- Google Sheets：`Space Reset｜空間初步檢視回覆`
- 表單送出觸發器：有人填表時執行 Telegram 通知函式

## 重要限制

Google Apps Script 不能自動建立 Google Forms 的「檔案上傳」題型。  
所以這個一鍵腳本採用穩定做法：讓客戶貼 Google Drive、Dropbox、iCloud 或其他雲端資料夾連結。

如果你堅持使用 Google 表單內建「檔案上傳」，請先用本腳本建立表單，再手動把以下三題改成檔案上傳題：

- `平面圖或手繪圖連結`
- `空間照片連結`
- `補充資料連結`

## 操作步驟

### 1. 開 Apps Script

1. 打開：<https://script.google.com/>
2. 點左上角：`新增專案`
3. 把預設程式碼全部刪掉
4. 貼上 `create-space-reset-form-with-telegram.js` 的全部內容
5. 按儲存
6. 專案名稱建議改成：
   `Space Reset 表單建立器`

### 2. 執行建立表單

1. 上方函式下拉選單選：`setupSpaceResetForm`
2. 點 `執行`
3. 第一次會跳 Google 授權，照畫面允許
4. 執行完成後，左側點 `執行項目`
5. 點剛剛那次執行紀錄
6. 看 `記錄`，你會看到三個網址：
   - 表單編輯網址
   - 表單填寫網址
   - 回覆試算表

把「表單填寫網址」複製起來，等一下接到網站 CTA。

### 3. 設定 Telegram

1. 先到 Telegram 對 `n8n303_report_bot` 傳 `/start`
2. 回 Apps Script 左側點：`專案設定`
3. 找到：`指令碼屬性`
4. 新增：
   - 屬性：`TELEGRAM_BOT_TOKEN`
   - 值：貼上 BotFather 給你的 token
5. 回 Apps Script 編輯器
6. 上方函式下拉選單選：`getTelegramChatId`
7. 點 `執行`
8. 到左側 `執行項目` 看記錄，找到：

```json
"chat":{"id":123456789,
```

這個數字就是 chat id。

9. 回 `專案設定` → `指令碼屬性`
10. 新增：
    - 屬性：`TELEGRAM_CHAT_ID`
    - 值：貼上剛剛找到的 chat id

### 4. 測試通知

1. 上方函式下拉選單選：`testTelegramNotification`
2. 點 `執行`
3. Telegram 應該會收到測試通知

### 5. 測試表單提交

1. 打開剛剛建立的「表單填寫網址」
2. 自己填一筆測試資料
3. 檢查：
   - 回覆試算表有新增一列
   - Telegram 有收到通知

### 6. 接回網站

打開：

`script.js`

把：

```js
const FORM_URL = "";
```

改成：

```js
const FORM_URL = "你的表單填寫網址";
```

## 注意

- 檔案上傳題會要求填寫者登入 Google 帳號，這是 Google Forms 限制。
- 如果對方不方便登入，就讓他在「影片或雲端連結」貼雲端資料夾。
- Bot token 不要放進網站、GitHub 或公開文件。
- 如果 token 曾公開貼過，正式上線前建議到 BotFather 用 `/revoke` 換新 token。
