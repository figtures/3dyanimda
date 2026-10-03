import * as T from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { writeFileSync } from "node:fs";
// Original, illustrative flanged sleeve. Geometry demonstration, not a certified production file.
const root = new T.Group();
const shape = new T.Shape();
shape.absarc(0, 0, 33, 0, Math.PI * 2, false);
for (const [x, y, r] of [
  [0, 0, 12],
  [24, 0, 3],
  [0, 24, 3],
  [-24, 0, 3],
  [0, -24, 3],
]) {
  const hole = new T.Path();
  hole.absarc(x, y, r, 0, Math.PI * 2, true);
  shape.holes.push(hole);
}
const flange = new T.Mesh(
  new T.ExtrudeGeometry(shape, {
    depth: 6,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
    bevelSegments: 3,
    curveSegments: 48,
  }),
);
root.add(flange);
const profile = [
  [12, 6],
  [19, 6],
  [19, 10],
  [17, 12],
  [17, 38],
  [16, 40],
  [12, 40],
  [12, 6],
].map(([x, y]) => new T.Vector2(x, y));
const sleeve = new T.Mesh(new T.LatheGeometry(profile, 96));
sleeve.rotation.x = Math.PI / 2;
root.add(sleeve);
root.updateMatrixWorld(true);
const out = new STLExporter().parse(root, { binary: true });
writeFileSync("public/models/inspection-sample.stl", Buffer.from(out.buffer));
