const SPACE_RESET_FORM_TITLE = "Space Reset｜空間初步檢視資料上傳";
const SPACE_RESET_SHEET_TITLE = "Space Reset｜空間初步檢視回覆";
const TELEGRAM_API_BASE = "https://api.telegram.org/bot";
const SPACE_RESET_DRIVE_ROOT = "Space Reset｜資料庫與案件資料";

const DATABASE_SHEETS = [
  {
    name: "案件主表",
    headers: [
      "customer_id", "status", "case_type", "partner_name", "customer_name", "space_name",
      "contact", "reply_preference", "space_area", "start_date", "day_30_date",
      "drive_folder_url", "source_response_row", "primary_problem", "expected_change",
      "baseline_comfort", "baseline_stability", "baseline_clarity", "custom_metric_name",
      "custom_metric_baseline", "custom_metric_frequency", "report_url", "task_list_url",
      "theme_list_url", "d30_report_url", "consent_case_use", "payment_status",
      "package_type", "revenue_amount", "partner_commission", "notes"
    ],
    widths: [130, 120, 120, 140, 140, 180, 180, 140, 140, 110, 110, 260, 120, 260, 240, 110, 110, 110, 150, 150, 150, 260, 260, 260, 260, 130, 130, 130, 120, 150, 260],
  },
  {
    name: "TimeWaver報告",
    headers: [
      "tw_report_id", "customer_id", "analysis_date", "pdf_url", "ai_summary",
      "top_state", "priority_1", "priority_2", "priority_3", "erick_review_needed",
      "report_type", "ai_output_doc_url", "approved_by_erick", "approved_at", "notes"
    ],
    widths: [150, 130, 120, 260, 360, 260, 220, 220, 220, 260, 110, 260, 130, 130, 260],
  },
  {
    name: "診斷問題點",
    headers: [
      "issue_id", "customer_id", "tw_report_id", "issue_rank", "issue_title",
      "location_or_theme", "source_from_pdf", "possible_effect", "severity",
      "confidence", "erick_confirmed", "client_language", "notes"
    ],
    widths: [150, 130, 150, 90, 180, 200, 300, 260, 100, 100, 120, 300, 260],
  },
  {
    name: "實體任務",
    headers: [
      "task_id", "customer_id", "issue_id", "task_status", "task_title",
      "location_or_theme", "how_to_do", "estimated_time", "feedback_method",
      "due_date", "completed_at", "before_photo_url", "after_photo_url", "client_feedback", "notes"
    ],
    widths: [150, 130, 150, 120, 200, 180, 320, 120, 220, 110, 110, 260, 260, 260, 240],
  },
  {
    name: "支持主題",
    headers: [
      "theme_id", "customer_id", "theme_status", "support_theme", "related_issue",
      "observation_method", "week_no", "line_1_done", "line_2_adjustment",
      "line_3_next_focus", "send_status", "sent_at", "notes"
    ],
    widths: [150, 130, 120, 220, 220, 260, 90, 320, 320, 320, 120, 130, 260],
  },
  {
    name: "週回報",
    headers: [
      "response_id", "customer_id", "report_date", "week_no", "comfort_score",
      "stability_score", "clarity_score", "custom_metric_value", "visible_change",
      "remaining_block", "physical_tasks_done", "photo_urls", "consent_case_use",
      "partner_note", "internal_reviewed"
    ],
    widths: [170, 130, 120, 90, 110, 110, 110, 160, 320, 320, 260, 260, 130, 260, 130],
  },
  {
    name: "D30對照",
    headers: [
      "customer_id", "case_type", "d0_avg_score", "d30_avg_score", "score_change",
      "score_change_pct", "custom_metric_baseline", "custom_metric_d30",
      "weekly_report_count", "report_completion_rate", "usable_testimonial",
      "d30_summary_draft", "final_note"
    ],
    widths: [130, 120, 120, 120, 120, 130, 180, 160, 150, 170, 140, 360, 300],
  },
  {
    name: "夥伴營收",
    headers: [
      "transaction_id", "customer_id", "partner_name", "package_type", "list_price",
      "paid_amount", "payment_status", "paid_at", "commission_rate",
      "commission_amount", "commission_status", "refund_or_complaint", "notes"
    ],
    widths: [170, 130, 150, 130, 110, 110, 120, 120, 130, 150, 140, 180, 260],
  },
  {
    name: "設定",
    headers: ["key", "value", "description"],
    widths: [220, 420, 420],
  },
];

function setupSpaceResetForm() {
  const form = FormApp.create(SPACE_RESET_FORM_TITLE);
  form.setDescription([
    "請上傳你想請我們初步檢視的空間資料。",
    "",
    "準備很簡單：手機拍的照片，加上平面圖或手繪圖就可以。我們收到後會先看資料是否足夠，再回覆下一步。",
    "",
    "這份表單不是醫療、心理治療、裝修設計或風水保證；它的目的，是協助我們先了解空間現況與你最想看的問題。",
  ].join("\n"));
  form.setConfirmationMessage([
    "已收到你的 Space Reset 空間資料。",
    "",
    "我們會先看資料是否足夠，再回覆下一步。如果照片、平面圖或描述不足，可能會請你補充資料。",
    "",
    "提醒：這是初步檢視資料上傳，並不代表已正式開案。",
  ].join("\n"));
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setAcceptingResponses(true);

  addMultipleChoice_(form, "填寫身份", ["客戶本人", "合作夥伴代填", "其他"], true);
  addText_(form, "姓名", "請填寫方便我們或夥伴辨識的姓名。", true);
  addText_(form, "聯絡方式", "LINE、Email、電話或其他可聯絡方式。", true);
  addMultipleChoice_(form, "希望怎麼回覆你", ["LINE", "Email", "由合作夥伴聯絡", "其他"], true);
  addMultipleChoice_(form, "空間類型", ["居家空間", "店面", "辦公室・工作室", "診所或美容院", "展售空間", "其他商業空間", "先不確定"], true);
  addText_(form, "大約坪數", "例：28 坪、約 75 坪、兩層共 120 坪。90 坪以上、複合式或多樓層空間會先看資料後評估。", true);
  addText_(form, "空間名稱或所在區域", "例：台北工作室、新北住家、台中店面、台南辦公室。", true);
  addCheckbox_(form, "你最想看的空間重點", [
    "【居家】回到家之後反而更累、提不起勁",
    "【居家】睡眠不穩，容易醒或睡不深",
    "【居家】家人之間容易煩躁或起摩擦",
    "【居家】物件、角落或收納總是亂回來、不想靠近",
    "【店面】客人進店後停留時間短，很快離開",
    "【店面】入口、動線、收款、成交或預約容易卡",
    "【店面】員工或自己待在現場容易疲累消耗",
    "【辦公室／工作室】一進空間就覺得悶，難進入工作狀態",
    "【辦公室／工作室】會議、溝通或案子推進容易卡住",
    "其他／說不上來，但覺得空間不太對",
  ], "可複選。請依你的空間類型勾選最有感的項目；居家、店面、辦公室／工作室可分開看，不需要全部都選。", true);
  addParagraph_(form, "請用幾句話描述目前狀況", "可以先貼上網站 60 秒自測的「複製自測結果」，再補幾句你最有感的狀況。例：哪個位置最悶、最亂、最卡，或什麼時候特別明顯。", true);
  addParagraph_(form, "平面圖或手繪圖連結", "請貼 Google Drive、Dropbox、iCloud 或其他雲端連結。PDF / JPG / PNG 都可以。", false);
  addParagraph_(form, "空間照片連結", [
    "請盡量包含：",
    "1. 入口或大門",
    "2. 主要活動區域",
    "3. 走道或動線",
    "4. 收納、櫃台、床位、座位或工作區",
    "5. 你覺得最卡、最悶、最不舒服的位置",
    "",
    "請貼 Google Drive、Dropbox、iCloud 或其他雲端資料夾連結。照片不用修圖，能看清楚現場即可。",
  ].join("\n"), true);
  addParagraph_(form, "影片或其他雲端連結", "如果有影片、走拍、YouTube 私人連結或其他補充雲端資料，請貼在這裡。", false);
  addParagraph_(form, "補充資料連結", "可以貼 Google Drive、Dropbox、iCloud 或其他雲端資料連結。若你已完成網站上的 60 秒空間自測，也可以把「複製自測結果」貼在這裡，方便我們接著你的自測線索往下看。", false);
  addCheckbox_(form, "資料提供同意", [
    "我確認已取得空間資料提供同意，並同意我們使用這些資料做初步檢視",
  ], "", true);
  addParagraph_(form, "備註", "其他想補充的內容。", false);

  const spreadsheet = SpreadsheetApp.create(SPACE_RESET_SHEET_TITLE);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  setupSpaceResetDatabase_(spreadsheet);

  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(spreadsheet)
    .onFormSubmit()
    .create();

  Logger.log(`表單編輯網址：${form.getEditUrl()}`);
  Logger.log(`表單填寫網址：${form.getPublishedUrl()}`);
  Logger.log(`回覆試算表：${spreadsheet.getUrl()}`);
}

function setupSpaceResetDatabaseForCurrentSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("請從要建置的 Google Sheets 裡開啟 Apps Script，再執行這個函式。");
  }
  setupSpaceResetDatabase_(spreadsheet);
  Logger.log(`案件管理主表已建置：${spreadsheet.getUrl()}`);
}

function createCaseFolderFromActiveRow() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("請從案件管理 Google Sheets 裡執行這個函式。");
  }

  const sheet = spreadsheet.getSheetByName("案件主表");
  if (!sheet) throw new Error("找不到「案件主表」分頁。");

  const row = sheet.getActiveCell().getRow();
  if (row < 2) throw new Error("請先點選案件主表中的案件資料列，再執行。");

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  const rowObj = rowToObject_(headers, values);

  const customerId = rowObj.customer_id || `SPACE-${String(row - 1).padStart(4, "0")}`;
  const customerName = rowObj.customer_name || "未命名客戶";
  const spaceName = rowObj.space_name || "未命名空間";
  const caseFolder = createCaseFolder_(customerId, customerName, spaceName);

  const folderCol = headers.indexOf("drive_folder_url") + 1;
  if (folderCol > 0) {
    sheet.getRange(row, folderCol).setValue(caseFolder.getUrl());
  }

  Logger.log(`案件資料夾已建立：${caseFolder.getUrl()}`);
}

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    Logger.log("Telegram token/chat id not set. Skipping Telegram notification.");
    return;
  }

  const namedValues = (e && e.namedValues) || {};
  const spreadsheetUrl = (e && e.source && e.source.getUrl()) || SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const message = buildSpaceResetMessage_(namedValues, spreadsheetUrl);
  sendTelegramMessage_(token, chatId, message);
}

function testTelegramNotification() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("TELEGRAM_BOT_TOKEN");
  const chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in Script properties.");
  }

  sendTelegramMessage_(token, chatId, [
    "<b>Space Reset 測試通知</b>",
    "",
    "如果你看到這則訊息，代表 Telegram 通知已經接通。",
  ].join("\n"));
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

function addText_(form, title, helpText, required) {
  form.addTextItem()
    .setTitle(title)
    .setHelpText(helpText || "")
    .setRequired(required);
}

function addParagraph_(form, title, helpText, required) {
  form.addParagraphTextItem()
    .setTitle(title)
    .setHelpText(helpText || "")
    .setRequired(required);
}

function addMultipleChoice_(form, title, choices, required) {
  form.addMultipleChoiceItem()
    .setTitle(title)
    .setChoiceValues(choices)
    .setRequired(required);
}

function addCheckbox_(form, title, choices, helpText, required) {
  form.addCheckboxItem()
    .setTitle(title)
    .setHelpText(helpText || "")
    .setChoiceValues(choices)
    .setRequired(required);
}

function setupSpaceResetDatabase_(spreadsheet) {
  const rootFolder = getOrCreateRootFolder_();
  const folders = createDefaultFolders_(rootFolder);
  const existingSheets = spreadsheet.getSheets().map((sheet) => sheet.getName());

  DATABASE_SHEETS.forEach((sheetSpec) => {
    let sheet = spreadsheet.getSheetByName(sheetSpec.name);
    const isNewSheet = !sheet;
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetSpec.name);
    }
    setupDatabaseSheet_(sheet, sheetSpec, isNewSheet);
  });

  const settings = spreadsheet.getSheetByName("設定");
  writeSettings_(settings, {
    drive_root_url: rootFolder.getUrl(),
    intake_uploads_folder_url: folders.intakeUploads.getUrl(),
    timewaver_pdf_folder_url: folders.timewaverPdf.getUrl(),
    client_reports_folder_url: folders.clientReports.getUrl(),
    case_photos_folder_url: folders.casePhotos.getUrl(),
    templates_folder_url: folders.templates.getUrl(),
    built_at: new Date(),
    original_sheets: existingSheets.join(" / "),
  });

  applyDataValidation_(spreadsheet);
  applyD30Formulas_(spreadsheet);
}

function setupDatabaseSheet_(sheet, sheetSpec, isNewSheet) {
  if (isNewSheet) {
    sheet.clear();
  }
  if (sheet.getMaxColumns() < sheetSpec.headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), sheetSpec.headers.length - sheet.getMaxColumns());
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheetSpec.headers.length).setValues([sheetSpec.headers]);
  sheet.getRange(1, 1, 1, sheetSpec.headers.length)
    .setBackground("#1F4E5F")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setWrap(true);

  sheet.getRange(2, 1, Math.max(99, sheet.getMaxRows() - 1), sheetSpec.headers.length)
    .setWrap(true)
    .setVerticalAlignment("top");

  sheetSpec.widths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

  const filter = sheet.getFilter();
  if (filter) filter.remove();
  sheet.getRange(1, 1, 100, sheetSpec.headers.length).createFilter();
}

function writeSettings_(settingsSheet, values) {
  const rows = Object.keys(values).map((key) => [key, values[key], settingDescription_(key)]);
  if (rows.length) {
    settingsSheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }
}

function settingDescription_(key) {
  const descriptions = {
    drive_root_url: "Space Reset 的 Drive 根資料夾。",
    intake_uploads_folder_url: "客戶初步上傳資料、平面圖、照片連結的整理位置。",
    timewaver_pdf_folder_url: "TimeWaver PDF 原始檔存放位置。",
    client_reports_folder_url: "AI 產出的客戶交付報告與 PDF 存放位置。",
    case_photos_folder_url: "任務前後對照照片整理位置。",
    templates_folder_url: "報告模板、SOP、固定提示詞存放位置。",
    built_at: "最後一次執行資料庫建置的時間。",
    original_sheets: "建置前已存在的分頁名稱。",
  };
  return descriptions[key] || "";
}

function applyDataValidation_(spreadsheet) {
  setDropdown_(spreadsheet, "案件主表", "status", ["待診斷", "報告草稿待審", "進行中", "D30待收尾", "已結案", "暫停", "取消"]);
  setDropdown_(spreadsheet, "案件主表", "case_type", ["ABL居家", "I8商業", "先不確定"]);
  setDropdown_(spreadsheet, "案件主表", "reply_preference", ["LINE", "Email", "由合作夥伴聯絡", "其他"]);
  setDropdown_(spreadsheet, "案件主表", "consent_case_use", ["同意", "不同意", "需確認"]);
  setDropdown_(spreadsheet, "案件主表", "payment_status", ["未付款", "已付款", "部分付款", "退款", "不適用"]);
  setDropdown_(spreadsheet, "案件主表", "package_type", ["初步檢視", "簡版", "完整版", "30天支持", "其他"]);
  setDropdown_(spreadsheet, "TimeWaver報告", "report_type", ["簡版", "完整版"]);
  setDropdown_(spreadsheet, "TimeWaver報告", "approved_by_erick", ["TRUE", "FALSE", "需確認"]);
  setDropdown_(spreadsheet, "診斷問題點", "severity", ["高", "中", "低"]);
  setDropdown_(spreadsheet, "診斷問題點", "confidence", ["高", "中", "低", "需確認"]);
  setDropdown_(spreadsheet, "診斷問題點", "erick_confirmed", ["TRUE", "FALSE", "需確認"]);
  setDropdown_(spreadsheet, "實體任務", "task_status", ["待執行", "已交代", "客戶已完成", "待補照片", "暫停", "取消"]);
  setDropdown_(spreadsheet, "支持主題", "theme_status", ["待啟用", "進行中", "已完成", "暫停"]);
  setDropdown_(spreadsheet, "支持主題", "send_status", ["待發送", "已發送", "暫停"]);
  setDropdown_(spreadsheet, "週回報", "week_no", ["W1", "W2", "W3", "W4", "D30"]);
  setDropdown_(spreadsheet, "週回報", "consent_case_use", ["同意", "不同意", "需再次確認"]);
  setDropdown_(spreadsheet, "週回報", "internal_reviewed", ["TRUE", "FALSE"]);
  setDropdown_(spreadsheet, "夥伴營收", "payment_status", ["未付款", "已付款", "部分付款", "退款"]);
  setDropdown_(spreadsheet, "夥伴營收", "commission_status", ["未計算", "待支付", "已支付", "不適用"]);
}

function applyD30Formulas_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("D30對照");
  if (!sheet) return;

  const rowCount = 100;
  const formulas = {
    caseType: [],
    d0Avg: [],
    scoreChange: [],
    scoreChangePct: [],
    customBaseline: [],
    weeklyCount: [],
    completionRate: [],
    usableTestimonial: [],
  };

  for (let row = 2; row <= rowCount + 1; row += 1) {
    formulas.caseType.push([`=IF(A${row}="","",IFERROR(VLOOKUP(A${row},'案件主表'!A:C,3,FALSE),""))`]);
    formulas.d0Avg.push([`=IF(A${row}="","",IFERROR(AVERAGE(VLOOKUP(A${row},'案件主表'!A:R,16,FALSE),VLOOKUP(A${row},'案件主表'!A:R,17,FALSE),VLOOKUP(A${row},'案件主表'!A:R,18,FALSE)),""))`]);
    formulas.scoreChange.push([`=IF(OR(C${row}="",D${row}=""),"",D${row}-C${row})`]);
    formulas.scoreChangePct.push([`=IF(OR(C${row}="",D${row}=""),"",IFERROR((D${row}-C${row})/C${row},""))`]);
    formulas.customBaseline.push([`=IF(A${row}="","",IFERROR(VLOOKUP(A${row},'案件主表'!A:T,20,FALSE),""))`]);
    formulas.weeklyCount.push([`=IF(A${row}="","",COUNTIF('週回報'!B:B,A${row}))`]);
    formulas.completionRate.push([`=IF(I${row}="","",I${row}/4)`]);
    formulas.usableTestimonial.push([`=IF(AND(F${row}>=20%,J${row}>=75%),TRUE,FALSE)`]);
  }

  sheet.getRange(2, 2, rowCount, 1).setFormulas(formulas.caseType);
  sheet.getRange(2, 3, rowCount, 1).setFormulas(formulas.d0Avg);
  sheet.getRange(2, 5, rowCount, 1).setFormulas(formulas.scoreChange);
  sheet.getRange(2, 6, rowCount, 1).setFormulas(formulas.scoreChangePct);
  sheet.getRange(2, 7, rowCount, 1).setFormulas(formulas.customBaseline);
  sheet.getRange(2, 9, rowCount, 1).setFormulas(formulas.weeklyCount);
  sheet.getRange(2, 10, rowCount, 1).setFormulas(formulas.completionRate);
  sheet.getRange(2, 11, rowCount, 1).setFormulas(formulas.usableTestimonial);
  sheet.getRange("F2:F101").setNumberFormat("0.0%");
  sheet.getRange("J2:J101").setNumberFormat("0.0%");
}

function setDropdown_(spreadsheet, sheetName, headerName, values) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = headers.indexOf(headerName) + 1;
  if (col < 1) return;

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, col, 100, 1).setDataValidation(rule);
}

function getOrCreateRootFolder_() {
  const folders = DriveApp.getFoldersByName(SPACE_RESET_DRIVE_ROOT);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(SPACE_RESET_DRIVE_ROOT);
}

function createDefaultFolders_(rootFolder) {
  return {
    intakeUploads: getOrCreateChildFolder_(rootFolder, "00_初步上傳資料"),
    timewaverPdf: getOrCreateChildFolder_(rootFolder, "01_TimeWaver_PDF"),
    clientReports: getOrCreateChildFolder_(rootFolder, "02_客戶報告"),
    casePhotos: getOrCreateChildFolder_(rootFolder, "03_案件照片"),
    templates: getOrCreateChildFolder_(rootFolder, "04_模板與SOP"),
  };
}

function createCaseFolder_(customerId, customerName, spaceName) {
  const rootFolder = getOrCreateRootFolder_();
  const casesRoot = getOrCreateChildFolder_(rootFolder, "10_案件資料夾");
  const safeName = sanitizeFolderName_(`${customerId}_${customerName}_${spaceName}`);
  const caseFolder = getOrCreateChildFolder_(casesRoot, safeName);
  getOrCreateChildFolder_(caseFolder, "01_客戶原始資料");
  getOrCreateChildFolder_(caseFolder, "02_TimeWaver_PDF");
  getOrCreateChildFolder_(caseFolder, "03_AI報告草稿");
  getOrCreateChildFolder_(caseFolder, "04_交付報告");
  getOrCreateChildFolder_(caseFolder, "05_任務回報照片");
  getOrCreateChildFolder_(caseFolder, "06_D30對照");
  return caseFolder;
}

function getOrCreateChildFolder_(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(name);
}

function sanitizeFolderName_(value) {
  return String(value).replace(/[\\/:*?"<>|#%{}~&]/g, "-").replace(/\s+/g, " ").trim();
}

function rowToObject_(headers, values) {
  return headers.reduce((obj, header, index) => {
    obj[header] = values[index];
    return obj;
  }, {});
}

function buildSpaceResetMessage_(namedValues, spreadsheetUrl) {
  const line = (label, key) => {
    const value = valueFromNamedValues_(namedValues, key);
    if (!value) return "";
    return `<b>${escapeHtml_(label)}：</b>${escapeHtml_(value)}`;
  };

  return [
    "<b>Space Reset 有新的空間資料上傳</b>",
    "",
    line("填寫身份", "填寫身份"),
    line("姓名", "姓名"),
    line("聯絡方式", "聯絡方式"),
    line("希望回覆方式", "希望怎麼回覆你"),
    line("空間類型", "空間類型"),
    line("空間名稱或所在區域", "空間名稱或所在區域"),
    line("想看的重點", ["你最想看的空間重點", "你最想請我們看的重點", "你最想請 " + "E" + "rick" + " 看的重點"]),
    line("目前狀況", "請用幾句話描述目前狀況"),
    line("平面圖或手繪圖連結", "平面圖或手繪圖連結"),
    line("空間照片連結", "空間照片連結"),
    line("影片或其他雲端連結", "影片或其他雲端連結"),
    line("補充資料連結", "補充資料連結"),
    line("備註", "備註"),
    "",
    `<b>回覆表：</b>${escapeHtml_(spreadsheetUrl)}`,
    "",
    "請到 Google Sheets 查看完整回覆與雲端資料連結。",
  ].filter(Boolean).join("\n");
}

function sendTelegramMessage_(token, chatId, text) {
  const response = UrlFetchApp.fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
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
