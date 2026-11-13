const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

export function screenshotFanMarkup(project, expanded = false) {
  const frames = [
    project.screenshots[1],
    project.screenshots[0],
    project.screenshots[2],
  ];
  return `<div class="preview-fan screenshot-fan ${expanded ? "expanded" : ""}" aria-hidden="true">${frames.map((frame, i) => `<div class="mini-window screenshot-window mini-${i}"><div class="screenshot-top"><span class="window-dots"><i></i><i></i><i></i></span><span>${project.name}</span><span>↗</span></div><img src="${assetUrl(frame.src)}" alt="" width="${i === 2 ? 375 : 1440}" height="${i === 2 ? 812 : 900}" loading="lazy" decoding="async" /><span class="preview-caption">${frame.label}</span></div>`).join("")}</div>`;
}

export function projectGalleryMarkup(project) {
  const first = project.screenshots[0];
  return `<figure class="project-gallery"><div class="gallery-screen"><img id="gallery-image" src="${assetUrl(first.src)}" alt="${first.alt}" width="1440" height="900" decoding="async" /></div><figcaption><span id="gallery-caption">${first.label}</span><span class="mono">РЕАЛЬНЫЙ СКРИНШОТ САЙТА / 13.11.2026</span></figcaption><div class="gallery-choices" role="group" aria-label="Скриншоты проекта">${project.screenshots.map((frame, i) => `<button type="button" class="gallery-choice ${i === 0 ? "is-active" : ""}" data-screenshot="${i}" aria-pressed="${i === 0}" aria-controls="gallery-image"><img src="${assetUrl(frame.src)}" alt="" width="80" height="50" loading="lazy" /><span>${frame.label}</span></button>`).join("")}</div></figure>`;
}

export function initProjectGallery(container, project) {
  const image = container.querySelector("#gallery-image");
  const caption = container.querySelector("#gallery-caption");
  const buttons = [...container.querySelectorAll("[data-screenshot]")];
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.screenshot);
      const frame = project.screenshots[index];
      image.src = assetUrl(frame.src);
      image.alt = frame.alt;
      image.width = index === 2 ? 375 : 1440;
      image.height = index === 2 ? 812 : 900;
      caption.textContent = frame.label;
      buttons.forEach((choice, i) => {
        choice.classList.toggle("is-active", index === i);
        choice.setAttribute("aria-pressed", String(index === i));
      });
    }),
  );
}
