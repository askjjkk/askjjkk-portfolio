import { gsap } from "gsap";

export function initPreloader(reducedMotion) {
  return new Promise((resolve) => {
    const counter = document.getElementById("load-counter");
    const bar = document.getElementById("load-progress");
    const progress = { value: 0 };
    const finish = () => {
      document.documentElement.classList.add("page-visible");
      document.getElementById("preloader").setAttribute("aria-hidden", "true");
      counter.innerHTML = "100<span>%</span>";
      bar.style.width = "100%";
      if (!reducedMotion) {
        gsap.from(".title-line > span", {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.15,
          clearProps: "transform",
        });
        gsap.from(".hero-enter", {
          opacity: 0,
          y: 16,
          duration: 0.9,
          stagger: 0.1,
          delay: 0.45,
          clearProps: "all",
        });
      }
      resolve();
    };
    if (
      reducedMotion ||
      document.documentElement.classList.contains("page-visible")
    ) {
      finish();
      return;
    }
    gsap.to(progress, {
      value: 100,
      duration: 1.05,
      ease: "power2.inOut",
      onUpdate: () => {
        counter.innerHTML = `${Math.floor(progress.value).toString().padStart(2, "0")}<span>%</span>`;
        bar.style.width = `${progress.value}%`;
      },
      onComplete: finish,
    });
  });
}
