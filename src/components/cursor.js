import { gsap } from "gsap";

export function initCursor(reducedMotion) {
  if (
    reducedMotion ||
    !matchMedia("(hover: hover) and (pointer: fine)").matches
  )
    return;
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  document.documentElement.classList.add("custom-cursor-enabled");
  const pointer = { x: -100, y: -100 };
  const smooth = { ...pointer };
  const ringX = gsap.quickSetter(ring, "x", "px");
  const ringY = gsap.quickSetter(ring, "y", "px");
  const dotX = gsap.quickSetter(dot, "x", "px");
  const dotY = gsap.quickSetter(dot, "y", "px");
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      dotX(pointer.x - 2.5);
      dotY(pointer.y - 2.5);
      const interactive = event.target.closest(
        "a, button, input, select, textarea",
      );
      ring.classList.toggle("is-link", Boolean(interactive));
      ring.classList.toggle(
        "is-project",
        Boolean(event.target.closest(".project-open")),
      );
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  gsap.ticker.add((_time, deltaMs) => {
    const factor = 1 - Math.exp(-12 * Math.min(deltaMs / 1000, 0.08));
    smooth.x += (pointer.x - smooth.x) * factor;
    smooth.y += (pointer.y - smooth.y) * factor;
    ringX(smooth.x - ring.offsetWidth / 2);
    ringY(smooth.y - ring.offsetHeight / 2);
  });
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      gsap.to(element, {
        x: (event.clientX - rect.left - rect.width / 2) * 0.15,
        y: (event.clientY - rect.top - rect.height / 2) * 0.2,
        duration: 0.35,
        overwrite: "auto",
      });
    });
    element.addEventListener("pointerleave", () =>
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.5)",
        overwrite: "auto",
      }),
    );
  });
}
