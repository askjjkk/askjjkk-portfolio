(function wireWorkshop() {
  "use strict";

  const form = document.querySelector("#prepare-form");
  const formPanel = document.querySelector("#prep-panel");
  const label = document.querySelector("#problem-label");
  const problem = form.elements.problem;
  const message = document.querySelector("#message");
  const openMessage = document.querySelector('#open-message');
  const messagePanel = document.querySelector("#message-panel");
  const messageFeedback = document.querySelector("#message-feedback");
  const copyAddress = document.querySelector("#copy-address");
  const addressFeedback = document.querySelector("#address-feedback");

  const modes = {
    starter: {
      label: "Что происходит при запуске?",
      example: "Например, слышен щелчок, двигатель не крутится",
      opening: "Здравствуйте! Хочу уточнить по ремонту стартера.",
      detail: "При запуске"
    },
    alternator: {
      label: "Что происходит с зарядкой?",
      example: "Например, индикатор аккумулятора загорается после запуска",
      opening: "Здравствуйте! Хочу уточнить по ремонту генератора.",
      detail: "Что происходит"
    },
    parts: {
      label: "Какая запчасть нужна?",
      example: "Например, втягивающее реле. Артикул, если известен",
      opening: "Здравствуйте! Хочу уточнить наличие запчасти.",
      detail: "Нужная деталь или маркировка"
    }
  };

  let currentMode = form.elements.mode.value;
  const drafts = new Map();

  function hideMessage() {
    message.value = "";
    messagePanel.hidden = true;
    messageFeedback.textContent = "";
  }

  function updateMode() {
    const mode = form.elements.mode.value;
    if (currentMode !== mode) {
      drafts.set(currentMode, problem.value);
      problem.value = drafts.get(mode) || "";
      currentMode = mode;
    }
    label.textContent = modes[mode].label;
    problem.placeholder = modes[mode].example;
    problem.setCustomValidity("");
    hideMessage();
  }

  form.addEventListener("change", (event) => {
    if (event.target.name === "mode") updateMode();
  });

  form.addEventListener("input", (event) => {
    if (event.target === problem) problem.setCustomValidity("");
    if (event.target.name !== "mode") hideMessage();
  });

  document.querySelectorAll("[data-pick]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      form.elements.mode.value = link.dataset.pick;
      updateMode();
      form.querySelector("input[name=mode]:checked").focus({preventScroll: true});
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const detail = problem.value.trim();
    if (!detail) {
      problem.setCustomValidity("Добавьте короткое описание.");
      problem.reportValidity();
      return;
    }

    const mode = modes[form.elements.mode.value];
    const car = form.elements.car.value.trim();
    const lines = [mode.opening];
    if (car) lines.push(`Автомобиль: ${car}`);
    lines.push(`${mode.detail}: ${detail}`);
    message.value = lines.join("\n");
    const whatsapp = new URL(openMessage.href);
    whatsapp.searchParams.set("text", message.value);
    openMessage.href = whatsapp;
    messagePanel.hidden = false;
    messageFeedback.textContent = "";
    message.focus();
  });

  document.querySelector("#copy-message").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      messageFeedback.textContent = "Текст скопирован.";
    } catch {
      message.focus();
      message.select();
      messageFeedback.textContent = "Текст выделен. Скопируйте его вручную.";
    }
  });

  copyAddress.addEventListener("click", async () => {
    const address = document.querySelector("#address");
    try {
      await navigator.clipboard.writeText(address.textContent.trim());
      addressFeedback.textContent = "Адрес скопирован.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(address);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      addressFeedback.textContent = "Адрес выделен. Скопируйте его вручную.";
    }
  });

  updateMode();
  formPanel.hidden = false;
  copyAddress.hidden = false;
})();
