const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeLqBfWor5-98l7i-RomNlkca9Cjdcd-OswEeHR9YlNlHiHUg/viewform?usp=publish-editor";

// Apps Script 網頁應用程式網址（部署後貼上，見 Google表單欄位與文案.md）
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwBWfhDKSFlo8QFrLKUhlouuxfvHQTPrXFREBn8EzM-uolvqwBLvJ5NI7NWL-iN-jpC/exec";

// 綠界／藍新固定金額付款連結
const PAYMENT_LINKS = {
  home: { url: "https://p.ecpay.com.tw/C640B3E", amount: "NT$2,500", label: "居家空間檢測" },
  business: { url: "https://p.ecpay.com.tw/D25CF59", amount: "NT$3,500", label: "商業空間檢測" },
};

const header = document.querySelector("[data-header]");
const formLink = document.querySelector("[data-form-link]");
const formStatus = document.querySelector("[data-form-status]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// ---- 站內表單：送出即前往付款 ----
const leadForm = document.querySelector("[data-lead-form]");

if (leadForm) {
  const typeSelect = leadForm.querySelector("[data-space-type]");
  const submitBtn = leadForm.querySelector("[data-submit-btn]");

  const currentKind = () =>
    typeSelect.options[typeSelect.selectedIndex].dataset.kind || "home";

  const updateButton = () => {
    const plan = PAYMENT_LINKS[currentKind()];
    submitBtn.textContent = `送出資料，前往付款 ${plan.amount}`;
  };

  typeSelect.addEventListener("change", updateButton);
  updateButton();

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!leadForm.reportValidity()) return;

    const kind = currentKind();
    const plan = PAYMENT_LINKS[kind];
    const payload = {
      name: leadForm.name.value.trim(),
      email: leadForm.email.value.trim(),
      contact: leadForm.contact.value.trim(),
      type: typeSelect.value,
      note: leadForm.note.value.trim(),
      links: leadForm.links.value.trim(),
      source: "網站直送",
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";

    if (!WEB_APP_URL) {
      // 後端尚未部署：不跳轉、不開分頁，避免客戶面對兩個頁面
      formStatus.textContent =
        "系統設定中，暫時無法直接送出。請點下方「改用 Google 表單填寫」，我們收到後會回覆付款方式。";
      submitBtn.disabled = false;
      updateButton();
      return;
    }

    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (plan.url) {
        formStatus.textContent = "資料已送出，正在帶你前往付款頁…";
        window.location.href = plan.url;
      } else {
        formStatus.textContent = "資料已送出！付款連結已寄到你的 Email，完成付款就會排入檢測。";
        leadForm.reset();
        submitBtn.disabled = false;
        updateButton();
      }
    } catch (error) {
      formStatus.textContent =
        "送出失敗，資料還沒有進來。請點下方「改用 Google 表單填寫」，或直接聯絡我們，先不要付款。";
      submitBtn.disabled = false;
      updateButton();
    }
  });
}

// ---- 60 秒空間自測 ----
const QUIZ_DATA = {
  home: {
    label: "居家",
    questions: [
      { text: "回到家之後，反而更累、提不起勁？", dim: "休息品質" },
      { text: "睡眠不穩，容易醒或睡不深？", dim: "休息品質" },
      { text: "東西收了又亂，好像永遠整理不完？", dim: "物件收納" },
      { text: "有些東西很久沒用，卻一直捨不得處理？", dim: "物件收納" },
      { text: "家裡有些角落，你會下意識避開或不想久待？", dim: "空間使用" },
      { text: "有些空間變成堆放區，原本的功能已經不見了？", dim: "空間使用" },
      { text: "在家容易心浮氣躁，小事就有摩擦？", dim: "情緒與關係" },
      { text: "想整理或改變，卻提不起手，或改了又打回原形？", dim: "情緒與關係" },
    ],
    results: [
      {
        max: 4,
        title: "你的空間目前大致穩定",
        copy: "大方向沒有明顯消耗訊號。如果你還是有說不上來的不對勁，通常是集中在一兩個特定位置——一次檢測就能幫你把那個位置找出來。",
      },
      {
        max: 10,
        title: "你的空間已經有明顯卡點",
        copy: "這幾個訊號同時出現，代表問題大概不是「再整理一次」就會消失。值得先做一次檢測，看清楚是哪個位置、什麼因素在讓你和家人累積消耗。",
      },
      {
        max: 16,
        title: "這個空間正在消耗你",
        copy: "這個分數代表家裡的狀態已經累積出明顯消耗，也開始影響休息與關係。建議先做一次完整檢測，把優先處理的位置找出來，再決定要不要進一步支持。",
      },
    ],
  },
  business: {
    label: "店面",
    questions: [
      { text: "客人進店後停留時間短，常很快就離開？", dim: "客流與停留" },
      { text: "有些區域客人幾乎不會走過去？", dim: "客流與停留" },
      { text: "詢問的人不少，成交卻常在最後一步卡住？", dim: "成交與回流" },
      { text: "回頭客的比例一直拉不起來？", dim: "成交與回流" },
      { text: "員工待在現場容易疲累，流動率偏高？", dim: "團隊狀態" },
      { text: "你自己待在店裡，會覺得悶或煩躁？", dim: "團隊狀態" },
      { text: "現場整理完很快又亂回來？", dim: "現場秩序" },
      { text: "換過陳列或動線，但生意沒有明顯變化？", dim: "現場秩序" },
    ],
    results: [
      {
        max: 4,
        title: "你的現場目前大致穩定",
        copy: "沒有明顯的消耗訊號。如果營運上還是有說不上來的卡，通常集中在入口、動線或收款位置——一次檢測就能幫你確認。",
      },
      {
        max: 10,
        title: "你的現場已經有明顯卡點",
        copy: "這幾個訊號同時出現，卡住的地方不只在產品或行銷，也要回頭看現場本身。先做一次檢測，看清楚是哪個位置在讓客人離開、讓團隊消耗。",
      },
      {
        max: 16,
        title: "這個現場正在消耗你的生意",
        copy: "這個分數代表現場已經出現明顯的客流流失與團隊消耗訊號。建議盡快做一次完整檢測，把優先處理的位置找出來，再決定調整的順序。",
      },
    ],
  },
  office: {
    label: "辦公室・工作室",
    questions: [
      { text: "一進辦公室就覺得悶，很難進入工作狀態？", dim: "專注與效率" },
      { text: "工作常被打斷，效率總是拉不起來？", dim: "專注與效率" },
      { text: "會議常沒有結論，或氣氛容易緊繃？", dim: "溝通與氣氛" },
      { text: "同事之間的摩擦或誤會，感覺特別多？", dim: "溝通與氣氛" },
      { text: "桌面與公共區域整理完很快又亂回來？", dim: "空間秩序" },
      { text: "有些區域或座位，大家會下意識避開？", dim: "空間秩序" },
      { text: "案子常推進到一半就卡住、不了了之？", dim: "推進動能" },
      { text: "換過座位或佈置，但整體狀態沒有明顯變化？", dim: "推進動能" },
    ],
    results: [
      {
        max: 4,
        title: "你的辦公空間目前大致穩定",
        copy: "沒有明顯的消耗訊號。如果團隊或案子還是有說不上來的卡，通常集中在特定位置或區域——一次檢測就能幫你確認。",
      },
      {
        max: 10,
        title: "你的辦公空間已經有明顯卡點",
        copy: "這幾個訊號同時出現，卡住的地方不只在人或制度，也要回頭看空間本身。先做一次檢測，看清楚是哪個位置在影響專注與協作。",
      },
      {
        max: 16,
        title: "這個空間正在消耗你的團隊",
        copy: "這個分數代表辦公空間已經出現明顯消耗，正在影響團隊的專注與動能。建議先做一次完整檢測，把優先處理的位置找出來，再決定調整順序。",
      },
    ],
  },
};

const quiz = document.querySelector("[data-quiz]");

if (quiz) {
  const modeButtons = quiz.querySelectorAll("[data-quiz-mode]");
  const body = quiz.querySelector("[data-quiz-body]");
  const bar = quiz.querySelector("[data-quiz-bar]");
  const count = quiz.querySelector("[data-quiz-count]");
  const question = quiz.querySelector("[data-quiz-question]");
  const optionButtons = quiz.querySelectorAll(".quiz-options button");
  const backButton = quiz.querySelector("[data-quiz-back]");
  const result = quiz.querySelector("[data-quiz-result]");
  const scoreLine = quiz.querySelector("[data-quiz-score]");
  const resultTitle = quiz.querySelector("[data-quiz-title]");
  const resultDims = quiz.querySelector("[data-quiz-dims]");
  const resultCopy = quiz.querySelector("[data-quiz-copy]");
  const copyButton = quiz.querySelector("[data-quiz-copy-btn]");
  const restartButton = quiz.querySelector("[data-quiz-restart]");

  let mode = "home";
  let index = 0;
  let answers = [];
  let summaryText = "";

  const render = () => {
    const { questions } = QUIZ_DATA[mode];
    body.hidden = false;
    result.hidden = true;
    count.textContent = `第 ${index + 1} 題／共 ${questions.length} 題`;
    question.textContent = questions[index].text;
    bar.style.width = `${(index / questions.length) * 100}%`;
    backButton.hidden = index === 0;
  };

  const finish = () => {
    const { label, questions, results } = QUIZ_DATA[mode];
    const total = answers.reduce((sum, value) => sum + value, 0);
    const tier = results.find((item) => total <= item.max);

    const dimScores = {};
    questions.forEach((item, i) => {
      dimScores[item.dim] = (dimScores[item.dim] || 0) + (answers[i] || 0);
    });
    const topDims = Object.entries(dimScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([dim]) => dim);

    body.hidden = true;
    result.hidden = false;
    scoreLine.textContent = `你的空間狀態分數：${total} / 16`;
    resultTitle.textContent = tier.title;
    resultDims.textContent = topDims.length
      ? `建議優先觀察：${topDims.join("、")}`
      : "目前沒有特別突出的卡點面向。";
    resultCopy.textContent = tier.copy;
    summaryText = `【Space Reset 60 秒自測】${label}｜總分 ${total}/16｜${tier.title}｜優先觀察：${topDims.join("、") || "無明顯卡點"}`;
  };

  const restart = () => {
    index = 0;
    answers = [];
    render();
  };

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modeButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      mode = button.dataset.quizMode;
      restart();
    });
  });

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      answers[index] = Number(button.dataset.score);
      if (index < QUIZ_DATA[mode].questions.length - 1) {
        index += 1;
        render();
      } else {
        finish();
      }
    });
  });

  backButton.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      render();
    }
  });

  restartButton.addEventListener("click", restart);

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
    } catch (error) {
      const helper = document.createElement("textarea");
      helper.value = summaryText;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    copyButton.textContent = "已複製，貼到表單就可以";
    setTimeout(() => {
      copyButton.textContent = "複製結果，貼到申請表";
    }, 2400);
  });

  render();
}

if (formLink) {
  formLink.addEventListener("click", (event) => {
    if (FORM_URL) {
      formLink.setAttribute("href", FORM_URL);
      formLink.setAttribute("target", "_blank");
      formLink.setAttribute("rel", "noopener");
      return;
    }

    event.preventDefault();
    if (formStatus) {
      formStatus.textContent = "目前還沒接 Google 表單網址。這一版先用來確認頁面流程與文案。";
    }
  });
}
