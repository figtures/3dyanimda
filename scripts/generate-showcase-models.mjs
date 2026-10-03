// Original illustrative models. Reproducible GLB files; not manufacturing drawings.
import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { writeFileSync, mkdirSync } from "node:fs";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((v) => {
      this.result = v;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((v) => {
      this.result = `data:${blob.type};base64,${Buffer.from(v).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
const mat = (color, metalness = 0.12, roughness = 0.38) =>
  new T.MeshStandardMaterial({ color, metalness, roughness });
const blue = mat("#3578ae"),
  orange = mat("#e89858"),
  dark = mat("#283743", 0.55),
  silver = mat("#b6cad4", 0.65),
  ivory = mat("#e9e0ca"),
  glass = mat("#618482", 0.38),
  green = mat("#58735d"),
  bronze = mat("#a77a46", 0.5);
function mesh(group, geo, material, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new T.Mesh(geo, material);
  m.position.set(...pos);
  m.rotation.set(...rot);
  group.add(m);
  return m;
}
const geometryCache = new Map();
function cached(key, make) {
  if (!geometryCache.has(key)) geometryCache.set(key, make());
  return geometryCache.get(key);
}
const box = (g, w, h, d, m, p) =>
  mesh(
    g,
    cached(
      `box:${w}:${h}:${d}`,
      () => new RoundedBoxGeometry(w, h, d, 1, 0.05),
    ),
    m,
    p,
  );
const cylinder = (g, r, h, m, p) =>
  mesh(
    g,
    cached(`cylinder:${r}:${h}`, () => new T.CylinderGeometry(r, r, h, 24)),
    m,
    p,
  );
function plate(g, w, d, h, m, y = 0, holes = true) {
  const s = new T.Shape();
  s.moveTo(-w / 2, -d / 2);
  s.lineTo(w / 2, -d / 2);
  s.lineTo(w / 2, d / 2);
  s.lineTo(-w / 2, d / 2);
  s.closePath();
  if (holes)
    for (const x of [-w / 2 + 0.32, w / 2 - 0.32])
      for (const z of [-d / 2 + 0.32, d / 2 - 0.32]) {
        const h = new T.Path();
        h.absarc(x, z, 0.12, 0, Math.PI * 2, true);
        s.holes.push(h);
      }
  return mesh(
    g,
    new T.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.03,
      bevelSegments: 2,
      curveSegments: 16,
    }),
    m,
    [0, y, 0],
    [-Math.PI / 2, 0, 0],
  );
}
function fixture() {
  const g = new T.Group();
  plate(g, 4.8, 3.3, 0.3, dark);
  for (const z of [-0.9, 0.55]) {
    const s = new T.Shape();
    s.moveTo(-1.3, 0);
    s.lineTo(1.3, 0);
    s.lineTo(0.95, 1.7);
    s.quadraticCurveTo(0, 2.7, -0.95, 1.7);
    s.closePath();
    const h = new T.Path();
    h.absarc(0, 1.42, 0.58, 0, Math.PI * 2, true);
    s.holes.push(h);
    mesh(
      g,
      new T.ExtrudeGeometry(s, {
        depth: 0.35,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.03,
        bevelSegments: 2,
        curveSegments: 24,
      }),
      blue,
      [0, 0.3, z],
    );
    mesh(g, new T.TorusGeometry(0.57, 0.1, 10, 36), orange, [
      0,
      1.72,
      z + 0.39,
    ]);
  }
  for (const x of [-1.8, 1.8])
    for (const z of [-1.1, 1.1]) {
      cylinder(g, 0.16, 0.15, silver, [x, 0.4, z]);
    }
  return g;
}
function impeller() {
  const g = new T.Group();
  cylinder(g, 1.8, 0.2, blue, [0, 0, 0]);
  cylinder(g, 0.45, 0.8, silver, [0, 0.42, 0]);
  for (let i = 0; i < 12; i++) {
    const s = new T.Shape();
    s.moveTo(0.4, 0);
    s.quadraticCurveTo(1.25, 0.2, 1.7, 0.75);
    s.lineTo(1.6, 0.83);
    s.quadraticCurveTo(1.1, 0.38, 0.38, 0.16);
    s.closePath();
    const b = mesh(
      g,
      new T.ExtrudeGeometry(s, {
        depth: 0.55,
        bevelEnabled: true,
        bevelSize: 0.035,
        bevelThickness: 0.025,
        bevelSegments: 2,
        curveSegments: 12,
      }),
      blue,
      [0, 0.14, 0],
      [-Math.PI / 2, 0, 0],
    );
    b.rotateZ((i * Math.PI) / 6);
  }
  mesh(
    g,
    new T.TorusGeometry(0.32, 0.055, 8, 32),
    orange,
    [0, 0.85, 0],
    [Math.PI / 2, 0, 0],
  );
  return g;
}
function enclosure() {
  const g = new T.Group();
  box(g, 3.6, 0.2, 2.6, blue, [0, 0, 0]);
  for (const z of [-1.2, 1.2]) box(g, 3.6, 0.95, 0.15, blue, [0, 0.5, z]);
  for (const x of [-1.72, 1.72]) box(g, 0.15, 0.95, 2.5, blue, [x, 0.5, 0]);
  box(g, 2.9, 0.08, 1.9, green, [0, 0.25, 0]);
  for (const x of [-1.2, 1.2])
    for (const z of [-0.8, 0.8]) cylinder(g, 0.12, 0.35, bronze, [x, 0.3, z]);
  for (let i = 0; i < 4; i++)
    box(g, 0.35, 0.15, 0.5, dark, [-0.8 + i * 0.52, 0.38, 0]);
  box(g, 3.7, 0.18, 2.7, ivory, [0, 1.9, 0]);
  for (let i = 0; i < 8; i++)
    box(g, 0.1, 0.025, 1.3, dark, [-0.8 + i * 0.23, 2, 0]);
  for (const x of [-1.5, 1.5]) cylinder(g, 0.09, 0.2, silver, [x, 2.17, 0.9]);
  return g;
}
function duct() {
  const g = new T.Group();
  const c = new T.CatmullRomCurve3([
    new T.Vector3(-1.5, 0, 0),
    new T.Vector3(-0.6, 0, 0),
    new T.Vector3(0.2, 0.5, 0),
    new T.Vector3(0.5, 1.4, 0),
  ]);
  mesh(g, new T.TubeGeometry(c, 30, 0.62, 24, false), dark);
  for (const x of [-1.5, -1.25])
    mesh(
      g,
      new T.TorusGeometry(0.63, 0.09, 8, 32),
      silver,
      [x, 0, 0],
      [0, Math.PI / 2, 0],
    );
  mesh(
    g,
    new T.TorusGeometry(0.63, 0.1, 8, 32),
    orange,
    [0.5, 1.42, 0],
    [Math.PI / 2, 0, 0],
  );
  for (let i = 0; i < 4; i++)
    mesh(
      g,
      new T.TorusGeometry(0.65, 0.035, 6, 24),
      dark,
      [-1.15 + i * 0.16, 0.02, 0],
      [0, Math.PI / 2, 0],
    );
  return g;
}
function clip() {
  const g = new T.Group();
  plate(g, 2.8, 1.8, 0.22, dark);
  const s = new T.Shape();
  s.moveTo(-0.65, 0);
  s.lineTo(-0.65, 1.6);
  s.quadraticCurveTo(0, 2.5, 0.65, 1.6);
  s.lineTo(0.65, 0.75);
  s.lineTo(0.4, 0.75);
  s.lineTo(0.4, 1.55);
  s.quadraticCurveTo(0, 2.05, -0.4, 1.55);
  s.lineTo(-0.4, 0);
  s.closePath();
  mesh(
    g,
    new T.ExtrudeGeometry(s, {
      depth: 0.75,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 2,
      curveSegments: 20,
    }),
    orange,
    [0, 0.25, -0.4],
  );
  return g;
}
function knob() {
  const g = new T.Group();
  cylinder(g, 1.2, 0.7, dark, [0, 0.35, 0]);
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    box(g, 0.13, 0.65, 0.18, dark, [
      1.18 * Math.cos(a),
      0.35,
      1.18 * Math.sin(a),
    ]);
  }
  cylinder(g, 1.03, 0.12, silver, [0, 0.78, 0]);
  mesh(
    g,
    new T.TorusGeometry(0.95, 0.055, 8, 40),
    orange,
    [0, 0.86, 0],
    [Math.PI / 2, 0, 0],
  );
  box(g, 0.08, 0.03, 0.55, orange, [0, 0.86, 0.53]);
  cylinder(g, 0.35, 0.7, dark, [0, -0.32, 0]);
  return g;
}
function tree(g, x, z) {
  cylinder(g, 0.04, 0.25, bronze, [x, 0.25, z]);
  mesh(g, new T.IcosahedronGeometry(0.2, 1), green, [x, 0.55, z]);
}
function architecture(kind) {
  const g = new T.Group();
  box(g, 5, 0.18, 3.7, ivory, [0, 0, 0]);
  box(g, 5.05, 0.13, 3.75, bronze, [0, -0.13, 0]);
  if (kind === "campus") {
    for (const [x, z, h] of [
      [-0.95, -0.4, 2.7],
      [0.8, 0.5, 1.6],
      [1.5, -0.6, 1],
    ]) {
      box(g, 1, h, 0.85, ivory, [x, h / 2 + 0.15, z]);
      for (let y = 0.45; y < h; y += 0.3)
        box(g, 1.035, 0.1, 0.87, glass, [x, y, z]);
    }
    box(g, 2, 0.22, 0.6, ivory, [-0.1, 0.5, -0.3]);
  } else if (kind === "villa") {
    box(g, 3.5, 0.15, 2.6, ivory, [0, 0.22, 0]);
    box(g, 2.8, 0.8, 1.8, glass, [0, 0.65, 0]);
    box(g, 3.2, 0.18, 2.2, ivory, [0, 1.1, 0]);
    box(g, 1.9, 0.75, 1.5, ivory, [-0.4, 1.5, 0]);
    box(g, 2.4, 0.13, 1.9, bronze, [-0.3, 1.93, 0]);
    box(g, 1.8, 0.05, 0.55, glass, [0.3, 0.12, 1.35]);
    for (let i = 0; i < 7; i++)
      box(g, 0.07, 0.75, 0.07, ivory, [-1.2 + i * 0.35, 0.65, 1]);
  } else {
    for (let i = 0; i < 6; i++) {
      const x = -1.5 + (i % 3) * 1.5,
        z = i < 3 ? -0.85 : 0.85,
        h = [1.5, 2.2, 1.1, 1, 1.7, 1.3][i];
      box(g, 0.85, h, 0.9, ivory, [x, h / 2 + 0.15, z]);
      for (let y = 0.4; y < h; y += 0.35)
        box(g, 0.88, 0.06, 0.93, glass, [x, y, z]);
    }
    box(g, 4.5, 0.02, 0.3, bronze, [0, 0.115, 0]);
  }
  for (const [x, z] of [
    [-2, 1.2],
    [-2, -1.2],
    [2, 1.25],
    [2, -1.2],
  ])
    tree(g, x, z);
  return g;
}
mkdirSync("public/models", { recursive: true });
const models = {
  fixture: fixture(),
  impeller: impeller(),
  enclosure: enclosure(),
  duct: duct(),
  clip: clip(),
  knob: knob(),
  campus: architecture("campus"),
  villa: architecture("villa"),
  district: architecture("district"),
};
for (const [name, group] of Object.entries(models)) {
  group.name = name;
  group.userData = {
    purpose: "Original illustrative showcase, not a production specification",
    license: "Project-owned",
  };
  group.updateMatrixWorld(true);
  const data = await new GLTFExporter().parseAsync(group, { binary: true });
  writeFileSync(`public/models/${name}.glb`, Buffer.from(data));
  console.log(name, data.byteLength);
}
