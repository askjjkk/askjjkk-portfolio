import { gsap } from "gsap";
import { projects, services } from "../data/content.js";
import { previewMarkup } from "./previews.js";
import { projectGalleryMarkup, initProjectGallery } from "./projectMedia.js";
import { validateRequest, buildRequest, buildMailto } from "./request.js";

export function initModals(lenis, reducedMotion) {
  const contact = document.getElementById("contact-modal");
  const project = document.getElementById("project-modal");
  const form = document.getElementById("contact-form");
  const serviceSelect = document.getElementById("client-service");
  const minecraftFields = document.getElementById("minecraft-fields");
  const status = document.getElementById("form-status");
  const manualCopy = document.getElementById("manual-copy");
  const manualText = document.getElementById("request-text");
  const page = document.getElementById("page-shell");
  let opener = null;
  let scrollY = 0;

  function updateMinecraft() {
    const isMinecraft = Boolean(
      services.find((item) => item.id === serviceSelect.value)?.minecraft,
    );
    minecraftFields.hidden = !isMinecraft;
    for (const input of minecraftFields.querySelectorAll("input")) {
      input.required = isMinecraft;
      input.disabled = !isMinecraft;
    }
  }
  serviceSelect.addEventListener("change", updateMinecraft);
  updateMinecraft();

  function open(dialog, trigger) {
    if (contact.open || project.open) return;
    opener = trigger;
    scrollY = window.scrollY;
    lenis?.stop();
    page.inert = true;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    dialog.showModal();
    dialog.scrollTop = 0;
    if (!reducedMotion)
      gsap.fromTo(
        dialog,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" },
      );
  }

  function restore() {
    page.inert = false;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({ top: scrollY, behavior: "instant" });
    lenis?.start();
    opener?.focus({ preventScroll: true });
  }
  [contact, project].forEach((dialog) => {
    dialog
      .querySelector("[data-close]")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", restore);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll("button, a[href], input, select, textarea"),
      ].filter((el) => !el.disabled && el.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });

  document.querySelectorAll("[data-contact]").forEach((button) =>
    button.addEventListener("click", () => {
      serviceSelect.value = button.dataset.service || "";
      updateMinecraft();
      status.textContent = "";
      manualCopy.hidden = true;
      clearErrors();
      open(contact, button);
      document.getElementById("client-name").focus({ preventScroll: true });
    }),
  );

  document.querySelectorAll(".project-open").forEach((button) =>
    button.addEventListener("click", () => {
      const data = projects.find(
        (item) => item.id === button.closest("[data-project]").dataset.project,
      );
      const detail = document.getElementById("project-detail");
      detail.style.setProperty("--project-accent", data.accent);
      const media = data.screenshots
        ? projectGalleryMarkup(data)
        : `<div class="project-detail-scene">${previewMarkup(data, true)}</div><span class="project-detail-label mono">Схематичное превью интерфейса</span>`;
      const links = data.links.length
        ? `<div class="project-detail-links">${data.links.map((link) => `<a class="button ${link.label === "Посмотреть сайт" ? "button-light" : "button-outline"}" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join("")}</div>`
        : "";
      detail.innerHTML = `<span class="dialog-eyebrow mono">${data.category.toUpperCase()}</span><h2 id="project-title">${data.title}</h2><span class="project-detail-status">${data.status}</span>${links}${media}<p>${data.description}</p><p class="project-detail-more">${data.detail}</p><div class="project-detail-tech">${data.tech.map((tech) => `<span>${tech}</span>`).join("")}</div>`;
      if (data.screenshots) initProjectGallery(detail, data);
      open(project, button);
    }),
  );

  function clearErrors() {
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
    });
  }
  function getValidatedData() {
    const data = Object.fromEntries(new FormData(form));
    const errors = validateRequest(data);
    clearErrors();
    for (const [key, message] of Object.entries(errors)) {
      form.elements[key].setAttribute("aria-invalid", "true");
      document.getElementById(`${key}-error`).textContent = message;
    }
    if (Object.keys(errors).length) {
      status.textContent = "Заполните отмеченные поля.";
      form.elements[Object.keys(errors)[0]].focus();
      return null;
    }
    return data;
  }
  form.addEventListener("input", (event) => {
    const field = event.target;
    if (field.hasAttribute("aria-invalid")) {
      field.removeAttribute("aria-invalid");
      const error = document.getElementById(`${field.name}-error`);
      if (error) error.textContent = "";
    }
  });
  function showManual(text) {
    manualText.value = text;
    manualCopy.hidden = false;
    manualText.focus();
    manualText.select();
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getValidatedData();
    if (!data) return;
    status.textContent =
      "Письмо подготовлено. Отправьте его в почтовой программе. Если она не открылась, скопируйте заявку.";
    manualText.value = buildRequest(data);
    const link = document.createElement("a");
    link.href = buildMailto(data);
    link.style.display = "none";
    contact.append(link);
    link.click();
    link.remove();
  });
  document
    .getElementById("copy-request")
    .addEventListener("click", async (event) => {
      const data = getValidatedData();
      if (!data) return;
      const text = buildRequest(data);
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(text);
        status.textContent =
          "Заявка скопирована. Вставьте её в письмо на askjjkk03@gmail.com.";
      } catch {
        status.textContent =
          "Автоматическое копирование недоступно. Выделите и скопируйте текст ниже.";
        showManual(text);
      } finally {
        button.disabled = false;
      }
    });
  document.getElementById("copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("askjjkk03@gmail.com");
      status.textContent = "Почта скопирована: askjjkk03@gmail.com";
    } catch {
      status.textContent = "Скопируйте почту из поля ниже.";
      showManual("askjjkk03@gmail.com");
    }
  });
}
