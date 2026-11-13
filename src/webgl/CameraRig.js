import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
export class CameraRig {
  constructor(camera, canvas, reducedMotion) {
    this.camera = camera;
    this.reducedMotion = reducedMotion;
    this.target = new THREE.Vector3();
    this.pointer = { x: 0, y: 0 };
    this.smooth = { x: 0, y: 0 };
    this.state = { y: 8, z: 20, targetY: -3, targetZ: -22 };
    this.onPointer = (event) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (
      !reducedMotion &&
      matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      window.addEventListener("pointermove", this.onPointer, { passive: true });
    if (!reducedMotion) {
      this.timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#main",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      this.timeline.to(
        this.state,
        { y: 13, z: -30, targetY: -7, targetZ: -45, ease: "none" },
        0,
      );
      this.fade = gsap.fromTo(
        canvas,
        { opacity: 1 },
        {
          opacity: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: "#projects",
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        },
      );
    }
    this.update(1);
  }
  update(delta) {
    const factor = 1 - Math.exp(-3 * Math.min(delta, 0.1));
    this.smooth.x = THREE.MathUtils.lerp(this.smooth.x, this.pointer.x, factor);
    this.smooth.y = THREE.MathUtils.lerp(this.smooth.y, this.pointer.y, factor);
    this.camera.position.set(
      this.smooth.x * 0.65,
      this.state.y - this.smooth.y * 0.35,
      this.state.z,
    );
    this.target.set(
      2 + this.smooth.x * 0.5,
      this.state.targetY + this.smooth.y * 0.2,
      this.state.targetZ,
    );
    this.camera.lookAt(this.target);
  }
  dispose() {
    window.removeEventListener("pointermove", this.onPointer);
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    this.fade?.scrollTrigger?.kill();
    this.fade?.kill();
  }
}
