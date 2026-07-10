# Space Reset｜Telegram 填表通知設定

目標：有人送出 Google 表單後，Telegram 立刻通知我們。

做法：Google 表單回覆進 Google Sheets，Google Sheets 用 Apps Script 發 Telegram。

## 你會用到的檔案

- 程式碼：`apps-script-telegram-notify.js`
- 表單欄位：`Google表單欄位與文案.md`

## 第 1 步：先跟 Bot 說話

1. 打開 Telegram。
2. 搜尋你的 bot：`n8n303_report_bot`
3. 點進去，按 `Start` 或傳一則訊息：`/start`

如果你要通知到群組：

1. 把 bot 加進群組。
2. 在群組裡傳一則訊息，例如：`test`

## 第 2 步：到回覆試算表開 Apps Script

1. 打開 Google 表單的回覆試算表：`Space Reset｜空間初步檢視回覆`
2. 上方選單點：`擴充功能`
3. 點：`Apps Script`
4. 進入 Apps Script 後，把預設內容全部刪掉。
5. 貼上 `apps-script-telegram-notify.js` 的全部程式碼。
6. 按左上角儲存，專案名稱可命名為：
   `Space Reset Telegram 通知`

## 第 3 步：設定 Script Properties

這一步是把 Telegram token 和 chat id 放到安全一點的位置，不寫死在程式碼裡。

1. Apps Script 左側點：`專案設定`（齒輪圖示）
2. 找到：`指令碼屬性`
3. 點：`新增指令碼屬性`
4. 新增第一筆：
   - 屬性：`TELEGRAM_BOT_TOKEN`
   - 值：貼上 BotFather 給你的 bot token
5. 先儲存。

## 第 4 步：取得 Telegram Chat ID

1. Apps Script 左上方的函式下拉選單，選：`getTelegramChatId`
2. 點 `執行`
3. 第一次會跳出 Google 授權，照畫面允許。
4. 執行後，點左側：`執行項目`
5. 打開剛剛那次執行紀錄，看 `記錄`
6. 找到類似這段：

```json
"chat":{"id":123456789,
```

或群組會像：

```json
"chat":{"id":-1001234567890,
```

這個數字就是 `TELEGRAM_CHAT_ID`。

然後回到：

1. 左側 `專案設定`
2. `指令碼屬性`
3. 新增第二筆：
   - 屬性：`TELEGRAM_CHAT_ID`
   - 值：貼上剛剛找到的 chat id

## 第 5 步：測試 Telegram 通知

1. Apps Script 左上方函式下拉選單，選：`testTelegramNotification`
2. 點 `執行`
3. Telegram 應該會收到：

```text
Space Reset 測試通知

如果你看到這則訊息，代表 Telegram 通知已經接通。
```

## 第 6 步：建立表單送出觸發器

1. Apps Script 左側點：`觸發條件`（時鐘圖示）
2. 點右下角：`新增觸發條件`
3. 設定：
   - 要執行的函式：`onFormSubmit`
   - 要執行的部署作業：`Head`
   - 事件來源：`試算表`
   - 事件類型：`提交表單時`
4. 按儲存。

## 第 7 步：實測一筆表單

1. 打開 Google 表單。
2. 自己送出一筆測試資料。
3. 確認三件事：
   - Google Sheets 有新增一列
   - Telegram 收到通知
   - 通知裡有姓名、聯絡方式、空間類型、想看的重點

## 安全提醒

- Bot token 不要放進網站、GitHub、公開文件或聊天截圖。
- 如果 token 曾經被公開分享，正式上線前可到 BotFather 使用 `/revoke` 重新產生 token。
- 換 token 後，只需要回到 Apps Script 的 `TELEGRAM_BOT_TOKEN` 屬性更新即可。

## 通知格式

Telegram 會收到類似：

```text
Space Reset 有新的空間資料上傳

填寫身份：客戶本人
姓名：王小姐
聯絡方式：LINE ...
希望回覆方式：LINE
空間類型：居家空間
空間名稱或所在區域：新北住家
想看的重點：家裡很悶、回家不放鬆
目前狀況：最近回家總覺得很累...

回覆表：https://docs.google.com/...

請到 Google Sheets 查看照片、平面圖與補充資料。
```
