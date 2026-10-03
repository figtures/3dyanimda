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

const jaw = new T.Group();
box(jaw, 1.3, .65, 1.4, dark, [0,0,0]);
for(const x of [-.65,.65]) {
 box(jaw,.25,1.3,1.1,blue,[x,.9,0]);
 box(jaw,.65,.25,1.1,silver,[x>0?.47:-.47,1.65,0]);
 for(let z=-.4;z<=.4;z+=.2)box(jaw,.13,.32,.07,orange,[x>0?.2:-.2,1.6,z]);
}
cylinder(jaw,.18,.9,silver,[0,-.7,0]);
const nest=new T.Group();
box(nest,3.4,.18,2.5,dark,[0,0,0]);
for(const x of [-1.1,0,1.1])for(const z of [-.65,.65]) {
 const support=mesh(nest,new T.TorusGeometry(.32,.12,12,32,Math.PI),green,[x,.35,z]);support.rotation.z=0;
 box(nest,.12,.45,.48,silver,[x-.32,.22,z]);box(nest,.12,.45,.48,silver,[x+.32,.22,z]);
}
const gauge=new T.Group();
box(gauge,2.8,.22,1.4,blue,[0,0,0]);
box(gauge,.25,2.5,1.4,blue,[-1.25,1.3,0]);
box(gauge,2.7,.25,1.4,blue,[0,2.6,0]);
for(const x of [-.65,0,.65]){const ring=mesh(gauge,new T.TorusGeometry(.19,.07,12,36),silver,[x,2.78,0]);ring.rotation.x=Math.PI/2;}
for(const [name,group] of Object.entries({'robot-gripper':jaw,'assembly-nest':nest,'drill-gauge':gauge})) {
 group.name=name;group.userData={purpose:'Original 3dsanayi-only illustrative specimen; not a validated manufacturing design',owner:'3dsanayi'};group.updateMatrixWorld(true);
 const data=await new GLTFExporter().parseAsync(group,{binary:true});writeFileSync(`public/models/${name}.glb`,Buffer.from(data));console.log(name,data.byteLength);
}
