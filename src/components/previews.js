const dots = '<span class="window-dots"><i></i><i></i><i></i></span>';
const line = (width = 75) => `<i class="ui-line" style="width:${width}%"></i>`;
const windowTop = (title) =>
  `<div class="preview-top">${dots}<span>${title}</span><span>↗</span></div>`;
const tile = (icon, title, subtitle) =>
  `<div class="ui-list-item"><span class="ui-icon">${icon}</span><span><b>${title}</b><small>${subtitle}</small></span><i class="ui-tick">✓</i></div>`;
const mountain = `<svg viewBox="0 0 240 96" class="mountain-svg"><defs><linearGradient id="mountain-fill" x2="0" y2="1"><stop stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M0 85 38 51 60 65 104 14 133 43 158 25 205 68 240 48V96H0Z" fill="url(#mountain-fill)"/><path d="m0 85 38-34 22 14 44-51 29 29 25-18 47 43 35-20" fill="none" stroke="currentColor" stroke-width=".7"/></svg>`;

const previews = {
  umbra: [
    `${windowTop("UMBRA / PROFILES")}<div class="ui-body"><div class="ui-heading"><b>Мои профили</b><span>＋</span></div><div class="profile-landscape">${mountain}<span>UMBRA</span><small>FABRIC / MINECRAFT</small></div><div class="profile-footer"><span>Основной профиль<small>Моды и настройки</small></span><b class="ui-pill">ИГРАТЬ ↗</b></div></div>`,
    `${windowTop("UMBRA / MODS")}<div class="ui-body"><div class="ui-heading"><b>Менеджер модов</b><span>⌕</span></div>${tile("◈", "Fabric API", "Библиотека")}${tile("◇", "Sodium", "Оптимизация")}${tile("✳", "Umbra HUD", "Игровой интерфейс")}<div class="ui-bottom-line">Установленные моды<span>＋ Добавить</span></div></div>`,
    `${windowTop("UMBRA / HUD")}<div class="hud-world">${mountain}<div class="hud-coordinates">X 128 / Y 64 / Z −32</div><div class="hud-cross">+</div><div class="hud-module">UMBRA<span>HUD / НАСТРОЙКИ</span><i></i><i></i></div><div class="hud-health">♡ ♡ ♡ ♡ ♡ ♡ ♡ ♡</div><div class="hud-hotbar">${"<i>◇</i>".repeat(7)}</div></div>`,
  ],
  modsmith: [
    `${windowTop("MODSMITH / CREATE")}<div class="ui-body"><div class="ui-heading"><b>Какую сборку создадим?</b><span>✳</span></div><div class="ui-prompt">Исследование мира,<br />новые биомы и уютные постройки<span class="prompt-caret"></span></div><div class="ui-tags"><span>Fabric</span><span>1.21.1</span><span>Приключения</span></div><div class="ui-cta">Подобрать моды <span>↗</span></div></div>`,
    `${windowTop("MODSMITH / DISCOVER")}<div class="ui-body"><div class="ui-heading"><b>Подборка модов</b><small>MODRINTH</small></div>${tile("▦", "Terralith", "Ландшафт и биомы")}${tile("♧", "Nature’s Compass", "Навигация")}${tile("▤", "Supplementaries", "Детали и декор")}<div class="ui-tags"><span>Мир</span><span>Исследование</span></div></div>`,
    `${windowTop("MODSMITH / EXPORT")}<div class="ui-body"><div class="export-symbol">↧</div><div class="export-title">Ваша следующая<br /><em>история.</em></div><div class="export-file"><span>▤</span><span>exploration.mrpack<small>Состав и зависимости</small></span><b>↗</b></div><div class="ui-cta">Экспортировать сборку <span>↓</span></div></div>`,
  ],
  axiom: [
    `${windowTop("AXIOM / AI BRUSH")}<div class="ui-body"><div class="ui-heading"><b>Кисть по описанию</b><span>✦</span></div><div class="ui-prompt">Создай кисть для каменных<br />арок с мхом по краям.</div><div class="ui-tags"><span>Lua</span><span>Axiom</span></div><div class="ui-cta">Сгенерировать скрипт <span>✧</span></div></div>`,
    `${windowTop("AXIOM / BRUSH.LUA")}<div class="code-editor"><div class="code-numbers">01<br />02<br />03<br />04<br />05<br />06<br />07<br />08</div><code><i>local</i> radius = 12<br /><i>local</i> moss = 0.24<br /><br /><i>function</i> brush(x, y, z)<br />&nbsp; <i>local</i> d = distance(x,z)<br />&nbsp; <i>if</i> d &lt; radius <i>then</i><br />&nbsp; &nbsp; <b>setBlock</b>("stone")<br />&nbsp; <i>end</i></code></div><div class="code-status">Lua / Редактор кисти<span>◇</span></div>`,
    `${windowTop("AXIOM / VOXEL PREVIEW")}<div class="voxel-scene"><div class="voxel-grid">${Array.from({ length: 49 }, (_, i) => `<i style="--voxel-height:${[0, 1, 2, 4, 3, 1, 0][i % 7] * [0, 1, 1, 2, 1, 1, 0][Math.floor(i / 7)]}"></i>`).join("")}</div><span class="voxel-label">СХЕМА КИСТИ / STONE + MOSS</span></div>`,
  ],
  daynote: [
    `${windowTop("DAYNOTE / TELEGRAM")}<div class="chat-ui"><div class="chat-message bot">Что запланируем?<small>Daynote</small></div><div class="chat-message own">Встреча по проекту</div><div class="chat-message bot">Выберите дату в календаре<span class="chat-inline">Открыть календарь ▦</span></div><div class="chat-input">Написать сообщение<span>➤</span></div></div>`,
    `${windowTop("DAYNOTE / CALENDAR")}<div class="ui-body"><div class="calendar-heading"><span>‹</span><b>Ноябрь</b><span>›</span></div><div class="calendar-grid">${["П", "В", "С", "Ч", "П", "С", "В"].map((x) => `<small>${x}</small>`).join("")}${Array.from({ length: 28 }, (_, i) => `<span class="${i === 12 ? "selected" : ""}">${i + 1}</span>`).join("")}</div><div class="ui-bottom-line">Выберите дату<span>Далее → Время</span></div></div>`,
    `${windowTop("DAYNOTE / EVENTS")}<div class="ui-body"><div class="ui-heading"><b>Мои события</b><span>＋</span></div><div class="agenda-event"><b>13<span>НОЯ</span></b><div>Встреча по проекту<small>18:00 / Обсудить детали</small></div></div><div class="agenda-event"><b>16<span>НОЯ</span></b><div>Показ интерфейса<small>12:30 / Подготовить проект</small></div></div><div class="ui-cta">Добавить событие <span>＋</span></div></div>`,
  ],
  video: [
    `${windowTop("VIDEO SEARCH / LIBRARY")}<div class="ui-body"><div class="ui-heading"><b>Локальные видео</b><span>＋</span></div>${tile("▷", "interview_01.mp4", "Распознавание речи")}${tile("▷", "lecture_02.mp4", "В очереди")}${tile("▷", "notes_03.mp4", "Добавлен в индекс")}<div class="video-progress"><i></i></div><div class="ui-bottom-line">faster-whisper<span>Локальная обработка</span></div></div>`,
    `${windowTop("VIDEO SEARCH / FIND")}<div class="ui-body"><div class="ui-search"><span>⌕</span> интересная идея<i>↵</i></div><div class="waveform">${Array.from({ length: 42 }, (_, i) => `<i style="--bar:${12 + Math.sin(i * 1.8) * 8 + (i % 7) * 4}px"></i>`).join("")}</div><div class="transcript">«…обсудим <mark>интересную идею</mark><br />для следующего проекта…»</div><div class="ui-tags"><span>С учётом словоформ</span></div></div>`,
    `${windowTop("VIDEO SEARCH / RESULTS")}<div class="ui-body"><div class="ui-heading"><b>Результаты поиска</b><span>▤</span></div><div class="video-result"><span>▷</span><div>interview_01.mp4<small>«…интересная идея…»</small></div><b>✓</b></div><div class="video-result"><span>▷</span><div>notes_03.mp4<small>«…интересные идеи…»</small></div><b>✓</b></div><div class="ui-cta">Скопировать выбранные <span>↗</span></div></div>`,
  ],
  bio: [
    `${windowTop("CYBER / BIO-SITE")}<div class="bio-hero"><span class="bio-eyebrow">DIGITAL / PERSONAL</span><div class="bio-orbit"></div><b>askjjkk<span>разработка / идеи / код</span></b><div class="bio-hero-bottom"><span>WEB · CODE · PLAY</span><span>↓</span></div></div>`,
    `${windowTop("CYBER / LINKS")}<div class="ui-body"><div class="ui-heading"><b>На связи</b><span>✳</span></div><div class="bio-link"><span>01</span> GitHub <b>↗</b></div><div class="bio-link"><span>02</span> Проекты <b>↗</b></div><div class="bio-link"><span>03</span> Рабочая почта <b>↗</b></div><div class="bio-link"><span>04</span> О разработке <b>↗</b></div></div>`,
    `${windowTop("CYBER / AUDIO")}<div class="player-ui"><div class="record-art"><i></i></div><div class="player-title">Sound of the interface<small>Аудиоплеер / схема интерфейса</small></div><div class="player-timeline"><i></i></div><div class="player-controls"><span>↶</span><span>ⅠⅠ</span><span>↷</span></div></div>`,
  ],
};

export function previewMarkup(project, expanded = false) {
  return `<div class="preview-fan ${expanded ? "expanded" : ""}" aria-hidden="true">${previews[project.id].map((markup, i) => `<div class="mini-window mini-${i}">${markup}<span class="preview-caption">${project.previews[i]}</span></div>`).join("")}</div>`;
}
