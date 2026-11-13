import * as THREE from "three";
import { gsap } from "gsap";
import { InstancedField } from "./InstancedField.js";
import { CameraRig } from "./CameraRig.js";

export class SceneManager {
  constructor(canvas, reducedMotion) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.mobile = window.innerWidth < 768;
    this.disposed = false;
    this.elapsed = 0;
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: !this.mobile,
      powerPreference: "high-performance",
    });
    if (!context) throw new Error("WebGL2 unavailable");
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: !this.mobile,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x060608, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060608, 0.024);
    this.camera = new THREE.PerspectiveCamera(
      48,
      innerWidth / innerHeight,
      0.1,
      140,
    );
    this.field = new InstancedField(this.scene, this.mobile, this.scene.fog);
    this.rig = new CameraRig(this.camera, canvas, reducedMotion);
    this.resize = () => {
      if (this.disposed) return;
      const mobile = window.innerWidth < 768;
      if (mobile !== this.mobile) {
        this.mobile = mobile;
        this.field.dispose();
        this.field = new InstancedField(
          this.scene,
          this.mobile,
          this.scene.fog,
        );
      }
      this.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, mobile ? 1.75 : 2),
      );
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.rig.update(1);
      this.render();
      canvas.dataset.instances = String(this.field.count);
    };
    this.tick = (_time, deltaMs) => {
      if (document.hidden || this.disposed || reducedMotion) return;
      const delta = Math.min(deltaMs / 1000, 0.06);
      this.elapsed += delta;
      this.field.update(this.elapsed);
      this.rig.update(delta);
      this.render();
    };
    this.onLost = (event) => {
      event.preventDefault();
      this.dispose();
    };
    canvas.addEventListener("webglcontextlost", this.onLost, { once: true });
    window.addEventListener("resize", this.resize, { passive: true });
    this.resize();
    document.documentElement.classList.add("webgl-ready");
    canvas.dataset.instances = String(this.field.count);
    gsap.ticker.add(this.tick);
  }
  render() {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    gsap.ticker.remove(this.tick);
    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.field.dispose();
    this.rig.dispose();
    this.renderer.dispose();
    this.canvas.style.opacity = "0";
    document.documentElement.classList.remove("webgl-ready");
  }
}
