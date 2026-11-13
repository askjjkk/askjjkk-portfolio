import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute vec3 barycentric;
  attribute float aSeed;
  varying vec3 vBarycentric;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vHeight;
  varying float vSeed;
  void main() {
    vec3 transformed = position;
    vec3 origin = instanceMatrix[3].xyz;
    float wave = sin(origin.x * 0.19 + origin.z * 0.13 + uTime * 0.35);
    transformed.x += sin(uTime * 0.3 + origin.z * 0.12) * pow(abs(position.y), 1.5) * 0.08;
    vec4 world = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
    world.y += wave * 0.55 + sin(origin.x * 0.12 - origin.z * 0.17 + uTime * 0.2) * 0.3;
    vWorldPosition = world.xyz;
    vBarycentric = barycentric;
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vHeight = position.y;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vBarycentric;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vHeight;
  varying float vSeed;
  void main() {
    vec3 derivative = fwidth(vBarycentric);
    vec3 edge = smoothstep(vec3(0.0), derivative * 1.1, vBarycentric);
    float outline = 1.0 - min(min(edge.x, edge.y), edge.z);
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(vec3(-0.4, 0.8, 0.5));
    float light = max(dot(normal, lightDirection), 0.0);
    float shimmer = 0.75 + 0.25 * sin(vSeed * 18.0 + uTime * 0.5);
    float tip = smoothstep(0.05, 0.9, vHeight);
    float rim = pow(1.0 - abs(dot(normalize(cameraPosition - vWorldPosition), normal)), 3.0);
    vec3 body = mix(vec3(0.018,0.017,0.026), vec3(0.20,0.19,0.25), light * 0.65);
    vec3 color = body + vec3(0.78,0.76,0.92) * outline * (0.15 + tip * 0.7) * shimmer;
    color += vec3(0.34,0.32,0.43) * rim * 0.22;
    float depth = length(cameraPosition - vWorldPosition);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
    color = mix(color, uFogColor, clamp(fog,0.0,1.0));
    gl_FragColor = vec4(color,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const haloVertex = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDistance;
  void main(){
    vUv = uv;
    vec4 world = modelMatrix * instanceMatrix * vec4(position,1.0);
    vDistance = length(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const haloFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vDistance;
  void main(){
    float radius = length(vUv - 0.5) * 2.0;
    float glow = pow(max(0.0,1.0-radius),3.0) * 0.13;
    glow *= exp(-vDistance * 0.035);
    gl_FragColor = vec4(vec3(0.65,0.61,0.8),glow);
    #include <colorspace_fragment>
  }
`;

function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class InstancedField {
  constructor(scene, mobile, fog) {
    this.count = mobile ? 1152 : 2304;
    this.uniforms = {
      uTime: { value: 0 },
      uFogColor: { value: fog.color },
      uFogDensity: { value: fog.density },
    };
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const vertices = geometry.attributes.position.count;
    const barycentric = new Float32Array(vertices * 3);
    for (let i = 0; i < vertices; i++) barycentric[i * 3 + (i % 3)] = 1;
    geometry.setAttribute(
      "barycentric",
      new THREE.BufferAttribute(barycentric, 3),
    );
    geometry.setAttribute(
      "aSeed",
      new THREE.InstancedBufferAttribute(
        Float32Array.from({ length: this.count }, (_, i) =>
          seededRandom(i + 32),
        ),
        1,
      ),
    );
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    });
    this.crystals = new THREE.InstancedMesh(geometry, material, this.count);
    this.crystals.frustumCulled = false;
    this.halos = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      this.count,
    );
    this.halos.frustumCulled = false;
    const dummy = new THREE.Object3D();
    const columns = mobile ? 32 : 48;
    for (let i = 0; i < this.count; i++) {
      const row = Math.floor(i / columns);
      const column = i % columns;
      const random = seededRandom(i);
      const x = (column - columns / 2) * (mobile ? 2.05 : 1.38) + random * 0.5;
      const z = -row * (mobile ? 1.95 : 1.45) + seededRandom(i + 45) * 0.5;
      const mound = Math.exp(-((x - 12) ** 2 + (z + 17) ** 2) / 190);
      const height = 0.65 + random * 1.15 + mound * 2.7;
      const terrain =
        Math.sin(x * 0.14 + z * 0.1) * 1.3 + Math.cos(z * 0.17) * 0.6;
      dummy.position.set(x, -5.7 + height * 0.45 + terrain, z);
      dummy.rotation.set(
        (random - 0.5) * 0.2,
        random * Math.PI,
        (seededRandom(i + 8) - 0.5) * 0.2,
      );
      dummy.scale.set(0.21 + random * 0.22, height, 0.21 + random * 0.22);
      dummy.updateMatrix();
      this.crystals.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, -5.7 + terrain, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(2.4, 2.4, 2.4);
      dummy.updateMatrix();
      this.halos.setMatrixAt(i, dummy.matrix);
    }
    this.crystals.instanceMatrix.needsUpdate = true;
    this.halos.instanceMatrix.needsUpdate = true;
    scene.add(this.crystals, this.halos);
    this.orbits = new THREE.Group();
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x8c879f,
      transparent: true,
      opacity: 0.08,
      wireframe: false,
      fog: true,
    });
    for (let i = 0; i < 3; i++) {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(6.4 + i * 0.15, 0.009, 3, 128),
        orbitMaterial,
      );
      orbit.rotation.set(0.3 + i * 0.6, 0.3 + i * 0.6, -0.4);
      this.orbits.add(orbit);
    }
    this.orbits.position.set(14, 5, -19);
    scene.add(this.orbits);
  }
  update(time) {
    this.uniforms.uTime.value = time;
    this.orbits.rotation.y = Math.sin(time * 0.06) * 0.1;
  }
  dispose() {
    [this.crystals, this.halos].forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.removeFromParent();
    });
    this.orbits.children.forEach((mesh) => {
      mesh.geometry.dispose();
    });
    this.orbits.children[0]?.material.dispose();
    this.orbits.removeFromParent();
  }
}
