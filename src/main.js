import "./styles/main.css";
import "./styles/components.css";
import "./styles/responsive.css";
import "./styles/business-preview.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { renderContent } from "./components/renderContent.js";
import { initPreloader } from "./animations/preloader.js";
import { initSmoothScroll } from "./animations/smoothScroll.js";
import { initScrollChoreo } from "./animations/scrollChoreo.js";
import { initModals } from "./components/modal.js";
import { initCursor } from "./components/cursor.js";
import { initSpotlights } from "./components/spotlight.js";

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
renderContent();
const preloader = initPreloader(reducedMotion);
const lenis = initSmoothScroll(reducedMotion);
initModals(lenis, reducedMotion);
initCursor(reducedMotion);
initSpotlights();

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
}
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  mobileNav.hidden = open;
  menuToggle.setAttribute("aria-expanded", String(!open));
  menuToggle.setAttribute("aria-label", open ? "Открыть меню" : "Закрыть меню");
});
mobileNav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

await preloader;
initScrollChoreo(lenis, reducedMotion);
window.__portfolioReady = true;

async function startScene() {
  let scene;
  try {
    const { SceneManager } = await import("./webgl/SceneManager.js");
    scene = new SceneManager(
      document.getElementById("webgl-canvas"),
      reducedMotion,
    );
    window.addEventListener("pagehide", () => scene.dispose(), { once: true });
  } catch {
    scene?.dispose();
    document.documentElement.classList.remove("webgl-ready");
    document.getElementById("webgl-canvas").style.opacity = "0";
    document.documentElement.classList.add("webgl-unavailable");
  }
}
startScene();
