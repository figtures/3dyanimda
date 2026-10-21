import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BED_HEIGHT, PRINT_HEIGHT, PRINT_LAYERS, PRINT_SEGMENTS, printPoint } from "./print-path";

/** Procedurally authored machine and part. No downloaded models or texture requests. */
export function buildPrinter() {
  const root = new THREE.Group();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geometry = <T extends THREE.BufferGeometry>(g: T) => { geometries.add(g); return g; };
  const material = <T extends THREE.Material>(m: T) => { materials.add(m); return m; };
  const graphite = material(new THREE.MeshStandardMaterial({ color: 0x30383e, metalness: .68, roughness: .36, envMapIntensity: .75 }));
  const edges = material(new THREE.MeshStandardMaterial({ color: 0x889398, metalness: .82, roughness: .29, envMapIntensity: .9 }));
  const black = material(new THREE.MeshStandardMaterial({ color: 0x151f27, metalness: .2, roughness: .65 }));
  const orange = material(new THREE.MeshStandardMaterial({ color: 0xe86425, metalness: .08, roughness: .4, side: THREE.DoubleSide, transparent: true }));
  const silver = material(new THREE.MeshStandardMaterial({ color: 0xb5c2c9, metalness: .9, roughness: .2 }));
  const brass = material(new THREE.MeshStandardMaterial({ color: 0xc9a46e, metalness: .8, roughness: .32 }));
  const box = geometry(new RoundedBoxGeometry(1, 1, 1, 2, .045));
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = root) => { const object = new THREE.Mesh(g, m); parent.add(object); return object; };
  const block = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material = graphite, parent: THREE.Object3D = root) => {
    const object = mesh(box, m, parent); object.scale.set(w, h, d); object.position.set(x, y, z); return object;
  };
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 16));
  const rod = (radius: number, length: number, x: number, y: number, z: number, horizontal = false, parent: THREE.Object3D = root) => {
    const object = mesh(cylinder, silver, parent); object.scale.set(radius, length, radius); object.position.set(x, y, z); if (horizontal) object.rotation.z = Math.PI / 2; return object;
  };

  block(3.55, .38, 2.95, 0, .28, 0);
  block(3.38, .06, 2.8, 0, .495, 0, edges);
  block(2.74, .055, 2.36, 0, BED_HEIGHT - .03, 0, black);
  for (const x of [-1.56, 1.56]) for (const z of [-1.25, 1.25]) {
    block(.28, .13, .28, x, .06, z, black);
    block(.15, 3.12, .15, x, 2.05, z);
    block(.025, 3.03, .04, x + (x > 0 ? -.064 : .064), 2.05, z + .055, edges);
  }
  for (const z of [-1.25, 1.25]) block(3.27, .19, .19, 0, 3.62, z);
  for (const x of [-1.56, 1.56]) block(.19, .19, 2.69, x, 3.62, 0);
  // Rear panel, two lead screws and a softly tinted side window.
  block(2.96, 2.94, .03, 0, 2.02, -1.29, material(new THREE.MeshStandardMaterial({ color: 0x535f67, metalness: .4, roughness: .55 })));
  for (const x of [-1.2, 1.2]) rod(.032, 2.88, x, 1.99, -1.13);
  const glass = mesh(geometry(new THREE.PlaneGeometry(2.35, 2.9)), material(new THREE.MeshStandardMaterial({ color: 0xb8d0d9, metalness: .1, roughness: .3, transparent: true, opacity: .085, side: THREE.DoubleSide, depthWrite: false })));
  glass.rotation.y = Math.PI / 2; glass.position.set(1.58, 2.03, 0);
  block(2.73, .026, .034, 0, 3.49, 1.2, material(new THREE.MeshBasicMaterial({ color: 0xe0f1ed })));

  const gridPoints: number[] = [];
  for (let i = -5; i <= 5; i++) {
    gridPoints.push(i * .23, BED_HEIGHT + .003, -1.08, i * .23, BED_HEIGHT + .003, 1.08);
    gridPoints.push(-1.24, BED_HEIGHT + .003, i * .2, 1.24, BED_HEIGHT + .003, i * .2);
  }
  const gridGeometry = geometry(new THREE.BufferGeometry()); gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPoints, 3));
  root.add(new THREE.LineSegments(gridGeometry, material(new THREE.LineBasicMaterial({ color: 0x91a0a7, transparent: true, opacity: .2 }))));

  const gantry = new THREE.Group(); root.add(gantry);
  block(3.1, .12, .13, 0, .41, -.12, graphite, gantry);
  rod(.026, 3.01, 0, .34, .015, true, gantry);
  rod(.026, 3.01, 0, .48, .015, true, gantry);
  for (const x of [-1.5, 1.5]) block(.18, .32, .33, x, .41, 0, black, gantry);
  const carriage = new THREE.Group(); gantry.add(carriage);
  block(.47, .45, .43, 0, .4, .03, graphite, carriage);
  block(.38, .27, .025, 0, .43, .255, black, carriage);
  const fan = mesh(geometry(new THREE.CylinderGeometry(.1, .1, .022, 24)), edges, carriage); fan.rotation.x = Math.PI / 2; fan.position.set(0, .43, .28);
  const fanCenter = mesh(geometry(new THREE.CylinderGeometry(.055, .055, .024, 20)), black, carriage); fanCenter.rotation.x = Math.PI / 2; fanCenter.position.set(0, .43, .294);
  for (let i = 0; i < 4; i++) block(.13, .014, .025, -.1 + i * .067, .30, .267, edges, carriage);
  block(.18, .1, .18, 0, .135, 0, silver, carriage);
  const nozzle = mesh(geometry(new THREE.ConeGeometry(.072, .15, 12)), brass, carriage); nozzle.rotation.x = Math.PI; nozzle.position.set(0, .065, 0);
  const nozzleGlow = mesh(geometry(new THREE.SphereGeometry(.024, 10, 8)), material(new THREE.MeshBasicMaterial({ color: 0xffa356 })), carriage); nozzleGlow.position.y = .006;

  // An external reel makes the manufacturing process immediately recognizable.
  const spool = new THREE.Group(); spool.position.set(1.95, 2.76, -.5); root.add(spool);
  block(.57, .09, .12, 1.72, 2.76, -.5, graphite);
  const roll = mesh(geometry(new THREE.CylinderGeometry(.45, .45, .24, 48)), material(new THREE.MeshStandardMaterial({ color: 0xc95926, roughness: .65, metalness: .02 })), spool); roll.rotation.z = Math.PI / 2;
  for (const x of [-.16, .16]) {
    const ring = mesh(geometry(new THREE.TorusGeometry(.51, .045, 8, 48)), graphite, spool); ring.rotation.y = Math.PI / 2; ring.position.x = x;
    const disc = mesh(geometry(new THREE.CylinderGeometry(.17, .17, .036, 24)), graphite, spool); disc.rotation.z = Math.PI / 2; disc.position.x = x;
    for (let i = 0; i < 5; i++) { const spoke = block(.025, .42, .035, x, 0, 0, graphite, spool); spoke.rotation.x = i * Math.PI * 2 / 5; spoke.position.y = Math.cos(spoke.rotation.x) * .3; spoke.position.z = Math.sin(spoke.rotation.x) * .3; }
  }

  const vertices: number[] = [], indices: number[] = [], layerLines: number[] = [];
  for (let row = 0; row <= PRINT_LAYERS; row++) {
    for (let col = 0; col <= PRINT_SEGMENTS; col++) {
      const p = printPoint(row / PRINT_LAYERS, col / PRINT_SEGMENTS * Math.PI * 2);
      vertices.push(p.x, p.y, p.z);
      if (row < PRINT_LAYERS && col < PRINT_SEGMENTS) {
        const a = row * (PRINT_SEGMENTS + 1) + col, b = a + PRINT_SEGMENTS + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
      if (col < PRINT_SEGMENTS) {
        const next = printPoint(row / PRINT_LAYERS, (col + 1) / PRINT_SEGMENTS * Math.PI * 2);
        layerLines.push(p.x * 1.003, p.y, p.z * 1.003, next.x * 1.003, next.y, next.z * 1.003);
      }
    }
  }
  const partGeometry = geometry(new THREE.BufferGeometry()); partGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3)); partGeometry.setIndex(indices); partGeometry.computeVertexNormals();
  const part = mesh(partGeometry, orange);
  const lineGeometry = geometry(new THREE.BufferGeometry()); lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(layerLines, 3));
  const layerMaterial = material(new THREE.LineBasicMaterial({ color: 0x9f3d19, transparent: true, opacity: .28 }));
  const layers = new THREE.LineSegments(lineGeometry, layerMaterial); root.add(layers);
  const bottom = mesh(geometry(new THREE.CircleGeometry(.43, 64)), orange); bottom.rotation.x = -Math.PI / 2; bottom.position.y = BED_HEIGHT + .004;
  const targetPoints: number[] = [];
  for (let meridian = 0; meridian < 6; meridian++) for (let row = 0; row < 24; row++) {
    const a = printPoint(row / 24, meridian * Math.PI / 3), b = printPoint((row + 1) / 24, meridian * Math.PI / 3);
    targetPoints.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const ghostGeometry = geometry(new THREE.BufferGeometry()); ghostGeometry.setAttribute("position", new THREE.Float32BufferAttribute(targetPoints, 3));
  const ghostMaterial = material(new THREE.LineBasicMaterial({ color: 0xc6cec8, transparent: true, opacity: .13, depthWrite: false }));
  root.add(new THREE.LineSegments(ghostGeometry, ghostMaterial));

  const cablePositions = new Float32Array(25 * 3);
  const cableGeometry = geometry(new THREE.BufferGeometry()); cableGeometry.setAttribute("position", new THREE.BufferAttribute(cablePositions, 3));
  const cable = new THREE.Line(cableGeometry, material(new THREE.LineBasicMaterial({ color: 0x535b60 }))); cable.frustumCulled = false; root.add(cable);
  const shadowCanvas = document.createElement("canvas"); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(64, 64, 5, 64, 64, 64); gradient.addColorStop(0, "rgba(34,37,33,.36)"); gradient.addColorStop(1, "rgba(34,37,33,0)"); shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(shadowCanvas); textures.add(texture);
    const shadow = mesh(geometry(new THREE.PlaneGeometry(6.5, 5.1)), material(new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }))); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.014;
  }
  const labelCanvas = document.createElement("canvas"); labelCanvas.width = 384; labelCanvas.height = 72;
  const labelContext = labelCanvas.getContext("2d");
  if (labelContext) {
    labelContext.fillStyle = "#1b242c"; labelContext.fillRect(0, 0, 384, 72); labelContext.fillStyle = "#e9eeee"; labelContext.font = "600 28px Arial"; labelContext.fillText("3D YANIMDA", 22, 46); labelContext.fillStyle = "#ec713a"; labelContext.fillRect(330, 28, 25, 4);
    const texture = new THREE.CanvasTexture(labelCanvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture);
    const label = mesh(geometry(new THREE.PlaneGeometry(1.45, .272)), material(new THREE.MeshBasicMaterial({ map: texture }))); label.position.set(-.61, .28, 1.48);
  }
  // One instanced draw call for all exposed fasteners.
  const screwGeometry = geometry(new THREE.CylinderGeometry(.026, .026, .012, 8));
  const screws = new THREE.InstancedMesh(screwGeometry, silver, 12); const dummy = new THREE.Object3D();
  for (let i = 0; i < 12; i++) { dummy.position.set(i % 2 ? 1.56 : -1.56, .65 + Math.floor(i / 2) * .55, 1.333); dummy.rotation.x = Math.PI / 2; dummy.updateMatrix(); screws.setMatrixAt(i, dummy.matrix); }
  root.add(screws);

  return {
    root,
    update(progress: number, head: {x: number; y: number; z: number}, opacity: number, lift: number, printing: boolean) {
      partGeometry.setDrawRange(0, Math.floor(progress * PRINT_LAYERS * PRINT_SEGMENTS) * 6);
      lineGeometry.setDrawRange(0, Math.floor(progress * PRINT_LAYERS) * PRINT_SEGMENTS * 2);
      orange.opacity = opacity; layerMaterial.opacity = .28 * opacity; ghostMaterial.opacity = .13 * (1 - progress);
      bottom.visible = progress > .002;
      gantry.position.set(0, head.y + lift, head.z); carriage.position.x = head.x; nozzleGlow.visible = printing;
      spool.rotation.x = -progress * 7;
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, inverse = 1 - t;
        cablePositions[i * 3] = inverse * inverse * 1.6 + 2 * inverse * t * 1.05 + t * t * head.x;
        cablePositions[i * 3 + 1] = inverse * inverse * 3.55 + 2 * inverse * t * 4.25 + t * t * (head.y + lift + .64);
        cablePositions[i * 3 + 2] = inverse * inverse * -.7 + 2 * inverse * t * -.3 + t * t * (head.z + .03);
      }
      cableGeometry.attributes.position.needsUpdate = true;
    },
    dispose() { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); screws.dispose(); },
  };
}
