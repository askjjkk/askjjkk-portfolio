import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
export function initScrollChoreo(lenis, reducedMotion) {
  const slides = [...document.querySelectorAll(".quality-slide")];
  const captions = [
    "ВИЗУАЛЬНАЯ ЦЕЛЬНОСТЬ",
    "ПОНЯТНОЕ ВЗАИМОДЕЙСТВИЕ",
    "КОМПЬЮТЕР И ТЕЛЕФОН",
  ];
  let activeSlide = 0;
  const setSlide = (index) => {
    if (activeSlide === index) return;
    activeSlide = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", index === i);
      slide.inert = index !== i;
      slide.setAttribute("aria-hidden", index !== i ? "true" : "false");
    });
    document
      .querySelectorAll(".slide-dots i")
      .forEach((dot, i) => dot.classList.toggle("active", index === i));
    document.getElementById("quality-counter").textContent = `0${index + 1}`;
    document.getElementById("quality-caption").textContent = captions[index];
  };
  document.querySelector("[data-quality-next]").addEventListener("click", () => {
    setSlide(1);
    document.getElementById("quality-caption").focus({ preventScroll: true });
  });
  const chapters = [...document.querySelectorAll(".quality-chapter")];
  const syncQuality = () => {
    const index = chapters.reduce(
      (current, chapter, i) =>
        chapter.getBoundingClientRect().top < window.innerHeight * 0.55
          ? i
          : current,
      0,
    );
    setSlide(index);
  };
  ScrollTrigger.create({
    trigger: ".quality-layout",
    start: "top bottom",
    end: "bottom top",
    onUpdate: syncQuality,
    onRefresh: syncQuality,
  });
  if (!reducedMotion) {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        clipPath: "inset(0 0 100% 0)",
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        clearProps: "clipPath,transform,opacity",
      });
    });
    gsap.utils.toArray(".project-card, .process-card").forEach((el, i) => {
      gsap.from(el, {
        y: 30,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        delay: (i % 3) * 0.045,
        scrollTrigger: { trigger: el, start: "top 96%", once: true },
        clearProps: "transform,opacity",
      });
    });
  }
  ScrollTrigger.matchMedia({
    "(max-width: 767px), (hover: none)": () => {
      document.querySelectorAll(".project-card").forEach((card) => {
        const animation = gsap
          .timeline({ paused: true })
          .call(() => card.classList.add("is-fanned"))
          .to({}, { duration: reducedMotion ? 0 : 0.55 });
        ScrollTrigger.create({
          trigger: card,
          start: "top 72%",
          end: "bottom 28%",
          animation,
          toggleActions: "play reverse play reverse",
          onToggle: (self) => card.classList.toggle("is-fanned", self.isActive),
        });
      });
    },
  });
  if (!reducedMotion) initVelocityMarquee(lenis);
  if (reducedMotion)
    document.querySelectorAll('a[href^="#"]').forEach((link) =>
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "instant", block: "start" });
        history.replaceState(null, "", link.getAttribute("href"));
      }),
    );
  ScrollTrigger.refresh();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  document.fonts?.addEventListener("loadingdone", () => ScrollTrigger.refresh());
}

function initVelocityMarquee(lenis) {
  const track = document.querySelector(".marquee-track");
  let velocity = 0;
  let smoothed = 0;
  let direction = 1;
  let position = 0;
  const setX = gsap.quickSetter(track, "x", "px");
  const updateVelocity = (event) => {
    velocity = event.velocity;
    if (Math.abs(velocity) > 0.2) direction = velocity > 0 ? 1 : -1;
  };
  if (lenis) lenis.on("scroll", updateVelocity);
  else
    ScrollTrigger.create({
      onUpdate: (self) =>
        updateVelocity({ velocity: self.getVelocity() / 100 }),
    });
  gsap.ticker.add((_time, delta) => {
    if (document.hidden) return;
    smoothed += (velocity - smoothed) * 0.06;
    velocity *= 0.97;
    const width = track.firstElementChild.getBoundingClientRect().width;
    position -=
      direction *
      (24 + Math.min(Math.abs(smoothed) * 7, 260)) *
      Math.min(delta / 1000, 0.06);
    position = ((position % width) - width) % width;
    setX(position);
  });
}
