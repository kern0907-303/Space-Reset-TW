# Space Reset｜居家・店面空間檢測網站（台灣版）

台灣版本地靜態網站。由原 Space Reset 網站架構完整複製而來，保留原版資料夾不覆蓋；本版改為台灣慣用語與 NT$ 定價。網站 CTA 已接上正式 Google 表單與綠界固定金額付款連結；填表通知採 Google Sheets Apps Script 直發 Telegram；第一版收初步檢視資料與檢測費，不承諾正式開案。

## 檔案

- `index.html`：首頁內容與銷售頁結構
- `styles.css`：網站視覺與響應式樣式
- `script.js`：導覽狀態與正式 Google 表單入口
- `assets/`：首屏照片與內部模板截圖
- `Google表單欄位與文案.md`：Google 表單欄位、說明文字與提交後訊息
- `Telegram填表通知設定.md`：有人填表後發 Telegram 通知的設定步驟
- `apps-script-telegram-notify.js`：貼到 Google Apps Script 的通知程式碼
- `一鍵建立Google表單說明.md`：用 Apps Script 自動建立表單與回覆試算表
- `create-space-reset-form-with-telegram.js`：建立 Google 表單、回覆試算表與 Telegram 觸發器的整合腳本

## 表單連結

目前台灣版 Google 表單已完成內容調整，發布後的填寫網址已接入 `script.js`：

```js
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeLqBfWor5-98l7i-RomNlkca9Cjdcd-OswEeHR9YlNlHiHUg/viewform?usp=publish-editor";
```

台灣版表單編輯網址：

```text
https://docs.google.com/forms/d/1pb9C-DVgtuqICDtdhpiKgXLZcgfghr3fKztNTiV4jc4/edit
```

若之後重建或發布新表單，只需要把這個常數換成新的「表單填寫網址」。

## 付款連結

目前台灣版空間檢測已接入綠界固定金額付款連結：

```js
const PAYMENT_LINKS = {
  home: { url: "https://p.ecpay.com.tw/C640B3E", amount: "NT$2,500", label: "居家空間檢測" },
  business: { url: "https://p.ecpay.com.tw/D25CF59", amount: "NT$3,500", label: "商業空間檢測" },
};
```

站內表單會依「空間類型」判斷付款連結：居家空間走居家檢測付款；店面、工作室、辦公室、診所或美容院、其他商業空間走商業空間檢測付款。

## 購買後感謝頁配置

`thanks.html` 是購買完成後的感謝頁，放在網站根目錄。Cloudflare Pages 啟用後，付款平台的成功導回網址設定為：

```text
https://space-reset-tw.pages.dev/thanks.html
```

付款取消或付款失敗的導回網址建議設定為：

```text
https://space-reset-tw.pages.dev/#pricing
```

這個頁面已設定 `noindex`，不需要放在主選單，也不建議當成廣告入口；它只負責承接付款完成後的下一步說明。

## 第一版設計方向

- 視覺：空間診斷感，避免玄學、風水、室內設計公司感
- 語言：第一層白話，不提 TimeWaver
- 一頁式導購順序：Hero 只做問題共鳴，不露價格；往下依序是症狀認同、問題重定義、檢視方式、交付內容、居家/商業入口、購買前疑慮、誠實限制、方案價格、資料上傳。價格不得放回第一屏。
- CTA：第一屏只引導「先看看是不是你的狀況 / 看我們怎麼檢視」；最後才引導上傳資料。這是初步檢視入口，不等於正式開案
- 入口：居家空間檢測 / 店面空間檢測
- 台灣定價與定錨：空間檢測分居家 NT$2,500、商業 NT$3,500；單月觀察是比較錨點，居家 NT$4,200 / NT$5,100 / NT$6,000，商業 NT$5,900 / NT$7,200 / NT$8,500；主推 3 個月支持期必須分成居家與商業兩段顯示，並直接列「單月價累計 3 個月 -> 一次付三個月支持價 -> 現省金額」。居家段為 NT$9,900 / NT$11,900 / NT$14,000，商業段為 NT$13,800 / NT$16,800 / NT$19,800；年約維持分居家 NT$33,000 起、商業 NT$46,000 起。前台不顯示比例換算；折抵文案統一寫「檢測費可全額折抵」，不限定購買月份。

## 圖片來源

- Hero photo: Lisa Anna on Unsplash
- Google Form header: `assets/google-form-header.jpg`，由首頁首屏照片裁切成 1600 x 400，供「空間初步檢視資料上傳」表單辨識使用
- Diagnostic previews: Space Reset internal first-version templates
