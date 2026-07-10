const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in Script properties.");
  }

  const namedValues = (e && e.namedValues) || {};
  const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();

  const paymentStatus = maybeSendPaymentEmail_(namedValues);

  const message = buildSpaceResetMessage_(namedValues, spreadsheetUrl, paymentStatus);
  sendTelegramMessage_(token, chatId, message);
}

// ---- 網站直送表單（doPost）----
// 部署方式：Apps Script → 部署 → 新增部署作業 → 網頁應用程式
//   執行身分：我；誰可以存取：所有人
// 把部署後的網址貼到網站 script.js 的 WEB_APP_URL。
function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = props.getProperty("TELEGRAM_CHAT_ID");

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonResponse_({ ok: false, error: "bad payload" });
  }

  const namedValues = {
    "填寫身份": [data.source || "網站直送"],
    "姓名": [data.name || ""],
    "Email（用來寄付款連結與檢測回覆）": [data.email || ""],
    "聯絡方式": [data.contact || ""],
    "空間類型": [data.type || ""],
    "請用幾句話描述目前狀況": [data.note || ""],
    "空間照片連結": [data.links || ""],
  };

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    spreadsheet.getSheetByName("網站直送") ||
    spreadsheet.insertSheet("網站直送");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["時間", "姓名", "Email", "聯絡方式", "空間類型", "目前狀況", "照片連結"]);
  }
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.contact || "",
    data.type || "",
    data.note || "",
    data.links || "",
  ]);

  const paymentStatus = maybeSendPaymentEmail_(namedValues);

  if (token && chatId) {
    const message = buildSpaceResetMessage_(
      namedValues,
      spreadsheet.getUrl(),
      `網站直送（已跳轉付款頁）｜${paymentStatus}`
    );
    sendTelegramMessage_(token, chatId, message);
  }

  return jsonResponse_({ ok: true });
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ---- 自動付款信 ----
// Script properties 需要設定：
//   PAYMENT_LINK_HOME     居家空間檢測付款連結（NT$2,500，綠界/藍新固定金額連結）
//   PAYMENT_LINK_BUSINESS 商業空間檢測付款連結（NT$3,500）
function maybeSendPaymentEmail_(namedValues) {
  const props = PropertiesService.getScriptProperties();
  const homeLink = props.getProperty("PAYMENT_LINK_HOME");
  const businessLink = props.getProperty("PAYMENT_LINK_BUSINESS");

  const email = extractEmail_(
    valueFromNamedValues_(namedValues, ["Email", "Email（用來寄付款連結與檢測回覆）", "聯絡方式"])
  );
  if (!email) {
    return "未寄付款信（找不到 Email，請人工回覆）";
  }

  const name = valueFromNamedValues_(namedValues, "姓名") || "你好";
  const type = valueFromNamedValues_(namedValues, "空間類型");
  const isHome = type.indexOf("居家") !== -1;
  const isUnsure = !type || type.indexOf("先不確定") !== -1;

  if (isUnsure) {
    MailApp.sendEmail({
      to: email,
      subject: "已收到你的空間資料｜Space Reset",
      name: "Space Reset 空間檢測",
      body: [
        `${name}，已收到你的空間資料。`,
        "",
        "因為你選了「先不確定空間類型」，我們會先看過資料，1 個工作天內回覆你適合的檢測方案與付款方式。",
        "",
        "檢測費可全額折抵任何正式支持方案。",
        "",
        "Space Reset｜艾伯林量子調頻",
      ].join("\n"),
    });
    return "已寄確認信（先不確定類型，待人工回覆付款方式）";
  }

  const link = isHome ? homeLink : businessLink;
  const amount = isHome ? "NT$2,500" : "NT$3,500";
  const label = isHome ? "居家空間檢測" : "商業空間檢測";

  if (!link) {
    return "未寄付款信（Script properties 缺少付款連結，請人工回覆）";
  }

  MailApp.sendEmail({
    to: email,
    subject: `已收到你的空間資料｜完成付款後開始檢測（${label} ${amount}）`,
    name: "Space Reset 空間檢測",
    body: [
      `${name}，已收到你的空間資料。`,
      "",
      `下一步只有一件事：完成${label}付款（${amount}），我們就會開始檢視。`,
      "",
      `付款連結：${link}`,
      "",
      "付款頁如果有「備註／留言」欄位，請填上你表單用的姓名和 Email，方便我們把付款和你的空間資料對起來。",
      "",
      "付款完成後：",
      "1. 我們會先確認你的照片與平面圖是否足夠，不足會先請你補充，不會硬做結論。",
      "2. 資料確認後 3 個工作天內，你會收到初步診斷：優先處理位置＋具體整理任務。",
      "3. 檢測費可全額折抵任何正式支持方案，等於先用小額看清楚，再決定要不要投入 90 天。",
      "",
      "如果對金額或流程有任何疑問，直接回覆這封信就可以。",
      "",
      "Space Reset｜艾伯林量子調頻",
    ].join("\n"),
  });

  return `已自動寄出付款信（${label} ${amount} → ${email}）`;
}

function extractEmail_(value) {
  if (!value) return "";
  const match = String(value).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return match ? match[0] : "";
}

function testTelegramNotification() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in Script properties.");
  }

  const testMessage = [
    "<b>Space Reset 測試通知</b>",
    "",
    "如果你看到這則訊息，代表 Telegram 通知已經接通。",
  ].join("\n");

  sendTelegramMessage_(token, chatId, testMessage);
}

function getTelegramChatId() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN in Script properties.");
  }

  const response = UrlFetchApp.fetch(`${TELEGRAM_API_BASE}${token}/getUpdates`, {
    method: "get",
    muteHttpExceptions: true,
  });

  Logger.log(response.getContentText());
}

function buildSpaceResetMessage_(namedValues, spreadsheetUrl, paymentStatus) {
  const line = (label, key) => {
    const value = valueFromNamedValues_(namedValues, key);
    if (!value) return "";
    return `<b>${escapeHtml_(label)}：</b>${escapeHtml_(value)}`;
  };

  const lines = [
    "<b>Space Reset 有新的空間資料上傳</b>",
    "",
    line("填寫身份", "填寫身份"),
    line("姓名", "姓名"),
    line("聯絡方式", "聯絡方式"),
    line("希望回覆方式", "希望怎麼回覆你"),
    line("空間類型", "空間類型"),
    line("空間名稱或所在區域", "空間名稱或所在區域"),
    line("想看的重點", ["你最想請我們看的重點", "你最想請 " + "E" + "rick" + " 看的重點"]),
    line("目前狀況", "請用幾句話描述目前狀況"),
    line("照片連結", "空間照片連結"),
    line("影片或雲端連結", "影片或雲端連結"),
    line("備註", "備註"),
    "",
    paymentStatus ? `<b>付款信：</b>${escapeHtml_(paymentStatus)}` : "",
    "",
    `<b>回覆表：</b>${escapeHtml_(spreadsheetUrl)}`,
    "",
    "請到 Google Sheets 查看照片、平面圖與補充資料。",
  ].filter(Boolean);

  return lines.join("\n");
}

function sendTelegramMessage_(token, chatId, text) {
  const url = `${TELEGRAM_API_BASE}${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(`Telegram send failed: ${status} ${response.getContentText()}`);
  }
}

function valueFromNamedValues_(namedValues, key) {
  if (Array.isArray(key)) {
    for (const candidate of key) {
      const candidateValue = valueFromNamedValues_(namedValues, candidate);
      if (candidateValue) return candidateValue;
    }
    return "";
  }

  const value = namedValues[key];
  if (Array.isArray(value)) return value.filter(Boolean).join("、").trim();
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
