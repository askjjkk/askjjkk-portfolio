export function initMusicPlayer() {
  const player = document.querySelector(".music-player");
  if (!player) return;
  const audio = player.querySelector("audio");
  const toggle = player.querySelector("[data-music-toggle]");
  const transport = player.querySelector(".music-transport");
  const seek = player.querySelector("[data-music-seek]");
  const elapsed = player.querySelector("[data-music-elapsed]");
  const duration = player.querySelector("[data-music-duration]");
  const status = player.querySelector("[data-music-status]");
  let wanted = false;
  let failed = false;
  let attempt = 0;
  let loadingTimer;

  const formatTime = (seconds) => {
    const time = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
  };
  const updateTimeline = () => {
    const ready = Number.isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !ready || failed;
    seek.max = ready ? String(audio.duration) : "1";
    seek.value = String(Math.floor(audio.currentTime));
    seek.setAttribute(
      "aria-valuetext",
      ready
        ? `${formatTime(audio.currentTime)} из ${formatTime(audio.duration)}`
        : "Перемотка доступна после запуска",
    );
    seek.style.setProperty(
      "--progress",
      `${ready ? (audio.currentTime / audio.duration) * 100 : 0}%`,
    );
    elapsed.textContent = formatTime(audio.currentTime);
    duration.textContent = ready ? formatTime(audio.duration) : "—:—";
  };
  const render = (state, message) => {
    const playing = state === "playing";
    const loading = state === "loading";
    player.classList.toggle("is-playing", playing);
    player.classList.toggle("is-loading", loading);
    toggle.setAttribute("aria-pressed", String(playing || loading));
    const label = loading
      ? "Отменить загрузку"
      : playing
        ? "Поставить на паузу"
        : failed
          ? "Повторить воспроизведение"
          : "Включить музыку";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    status.textContent = message;
  };
  const stopWaiting = () => clearTimeout(loadingTimer);
  const showError = () => {
    stopWaiting();
    wanted = false;
    failed = true;
    attempt++;
    audio.pause();
    render("error", "Не удалось загрузить. Попробуйте ещё раз.");
    updateTimeline();
  };

  toggle.addEventListener("click", async () => {
    if (wanted) {
      wanted = false;
      attempt++;
      stopWaiting();
      audio.pause();
      render("idle", "На паузе · включите, когда захочется");
      return;
    }
    const retry = failed;
    failed = false;
    wanted = true;
    const currentAttempt = ++attempt;
    if (retry) audio.load();
    if (audio.ended) audio.currentTime = 0;
    render("loading", "Загружаю трек…");
    loadingTimer = setTimeout(showError, 15000);
    try {
      await audio.play();
    } catch {
      if (currentAttempt === attempt && wanted) showError();
    }
  });
  audio.addEventListener("playing", () => {
    if (!wanted) {
      audio.pause();
      return;
    }
    stopWaiting();
    failed = false;
    render("playing", "Сейчас играет · можно листать дальше");
  });
  audio.addEventListener("pause", () => {
    if (failed || audio.ended) return;
    wanted = false;
    attempt++;
    stopWaiting();
    render("idle", "На паузе · включите, когда захочется");
  });
  audio.addEventListener("ended", () => {
    wanted = false;
    stopWaiting();
    render("idle", "Трек закончился · можно послушать ещё раз");
    updateTimeline();
  });
  audio.addEventListener("error", showError);
  for (const event of ["loadedmetadata", "durationchange", "timeupdate", "seeked"])
    audio.addEventListener(event, updateTimeline);
  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Number(seek.value), audio.duration);
    updateTimeline();
  });
  window.addEventListener("pagehide", () => {
    wanted = false;
    attempt++;
    stopWaiting();
    audio.pause();
  });
  audio.hidden = true;
  toggle.hidden = false;
  transport.hidden = false;
  updateTimeline();
}
