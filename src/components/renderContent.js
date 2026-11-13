import { projects, services, steps } from "../data/content.js";
import { previewMarkup } from "./previews.js";

export function renderContent() {
  document.getElementById("project-grid").innerHTML = projects
    .map(
      (project, i) =>
        `<article class="project-card spotlight" style="--project-accent:${project.accent}" data-project="${project.id}"><button class="project-open" aria-label="Подробнее: ${project.title}"><div class="project-scene"><span class="scene-index mono">${String(i + 1).padStart(2, "0")} / ${project.category.toUpperCase()}</span>${previewMarkup(project)}<span class="scene-grid" aria-hidden="true"></span></div><div class="project-info"><div class="project-meta mono"><span>${project.category}</span><span class="project-status">${project.status}</span></div><h3>${project.name}<span class="project-arrow">↗</span></h3><p>${project.description}</p><div class="project-tech mono">${project.tech.join(" / ")}</div></div></button></article>`,
    )
    .join("");
  document.getElementById("service-list").innerHTML = services
    .filter((service) => !service.standalone)
    .map(
      (service, i) =>
        `<article class="service-row"><span class="service-index mono">0${i + 1}</span><h3>${service.name}</h3><div class="service-description"><p>${service.description}</p><span class="mono">${service.tech}</span></div><span class="service-price">По задаче</span><button class="service-action" data-contact data-service="${service.id}" aria-label="Обсудить: ${service.name}">Обсудить <span>→</span></button></article>`,
    )
    .join("");
  document.getElementById("process-grid").innerHTML = steps
    .map(
      ([title, description], i) =>
        `<article class="process-card spotlight"><span class="process-number">0${i + 1}<i>↗</i></span><div><h3>${title}</h3><p>${description}</p></div></article>`,
    )
    .join("");
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  document
    .getElementById("client-service")
    .insertAdjacentHTML(
      "beforeend",
      services
        .map(
          (service) => `<option value="${service.id}">${service.name}</option>`,
        )
        .join(""),
    );
}
