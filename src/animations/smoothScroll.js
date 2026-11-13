import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
export function initSmoothScroll(reducedMotion) {
  if (reducedMotion) return null;
  const lenis = new Lenis({
    duration: 1.12,
    smoothWheel: true,
    touchMultiplier: 1.1,
    syncTouch: false,
    anchors: { offset: -100 },
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
