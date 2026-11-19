(function(){
const serviceButtons = [...document.querySelectorAll("[data-service]")];
for (const button of serviceButtons) {
  button.addEventListener("click", () => {
    for (const control of serviceButtons) control.setAttribute("aria-pressed", String(control === button));
    for (const panel of document.querySelectorAll("[data-panel]")) panel.hidden = panel.dataset.panel !== button.dataset.service;
  });
}

const dialog = document.querySelector("#assistant");
const form = dialog.querySelector(".chat-form");
const input = form.elements.question;
const messages = dialog.querySelector(".messages");
const suggestions = [...dialog.querySelectorAll("[data-suggest]")];
const history = [];
let opener;
let pending = false;
async function assistantEndpoint() {
  if (!document.querySelector('meta[name="assistant-host"]')) {
    return new URL("../api/ask",location.href);
  }
  const config = await fetch(new URL("./assistant-config.json",import.meta.url),{
    cache:"no-store",signal:AbortSignal.timeout(6000)
  });
  if (!config.ok) throw new Error("ИИ сейчас недоступен. Контакты мастерской есть в 2ГИС.");
  const {url} = await config.json();
  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new Error("ИИ сейчас недоступен. Контакты мастерской есть в 2ГИС.");
  }
  return new URL(url);
}
function append(text, style) {
  const bubble = document.createElement("p");
  bubble.className = "bubble " + style;
  bubble.textContent = text;
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}
function open(button) {
  opener = button;
  if (!dialog.open) dialog.showModal();
  if (button.dataset.question && !pending && !input.value) input.value = button.dataset.question;
  input.focus();
}
for (const button of document.querySelectorAll("[data-chat]")) button.addEventListener("click", () => open(button));
dialog.querySelector("[data-close-chat]").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => opener?.focus());
for (const button of suggestions) button.addEventListener("click", () => {
  input.value = button.dataset.suggest;
  form.requestSubmit();
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  const question = input.value.trim();
  if (pending || !question) return;
  pending = true;
  input.value = "";
  input.readOnly = true;
  const controls = [form.querySelector("button"), ...suggestions];
  for (const control of controls) control.disabled = true;
  const user = append(question, "user");
  const answer = append("Ассистент готовит ответ…", "ai");
  try {
    const response = await fetch(await assistantEndpoint(), {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({question, context:history.slice(-2)}),
      signal:AbortSignal.timeout(38_000)
    });
    const data = await response.json();
    if (!response.ok || !data.answer) throw new Error(data.error || "Ответ пока недоступен. Попробуйте ещё раз.");
    answer.textContent = data.answer;
    history.push(question);
    if (history.length > 2) history.shift();
  } catch (error) {
    input.value = question;
    user.remove();
    answer.classList.add("error");
    answer.textContent = error instanceof SyntaxError || error.name === "TimeoutError" || error instanceof TypeError
      ? "Ассистент сейчас недоступен. Вопрос сохранён — попробуйте ещё раз."
      : error.message;
  } finally {
    pending = false;
    input.readOnly = false;
    for (const control of controls) control.disabled = false;
    messages.scrollTop = messages.scrollHeight;
    if (dialog.open) input.focus();
  }
});
})();
