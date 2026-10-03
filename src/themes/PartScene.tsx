import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/** A locally constructed illustrative fixture. No external model or fake measurements. */
export default function PartScene({
  mode = "solid",
}: {
  mode?: "solid" | "wire" | "points";
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(7, 5.8, 8);
    camera.lookAt(0, 0.3, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x263151, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(-3, 6, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x839fff, 3);
    rim.position.set(5, 2, -4);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2655d8,
      roughness: 0.32,
      metalness: 0.23,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4b5d73,
      transparent: true,
      opacity: 0.65,
    });
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xb65031,
      size: 0.025,
    });
    const geometries: THREE.BufferGeometry[] = [];
    function add(
      geometry: THREE.BufferGeometry,
      x: number,
      y: number,
      z: number,
      rotation = 0,
    ) {
      geometries.push(geometry);
      let object: THREE.Object3D;
      if (mode === "wire") {
        const edges = new THREE.EdgesGeometry(geometry, 20);
        geometries.push(edges);
        object = new THREE.LineSegments(edges, lineMaterial);
      } else if (mode === "points") {
        const sampler = new MeshSurfaceSampler(
          new THREE.Mesh(geometry, material),
        ).build() as MeshSurfaceSampler & {
          // Present in the installed Three.js implementation, omitted by its typings.
          setRandomGenerator: (random: () => number) => MeshSurfaceSampler;
        };
        const position = new THREE.Vector3();
        const points = new Float32Array(7000 * 3);
        // Seeded samples keep static/export previews reproducible.
        let seed = 41;
        sampler.setRandomGenerator(() => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        });
        for (let i = 0; i < 7000; i++) {
          sampler.sample(position);
          position.toArray(points, i * 3);
        }
        const cloud = new THREE.BufferGeometry();
        cloud.setAttribute("position", new THREE.BufferAttribute(points, 3));
        geometries.push(cloud);
        object = new THREE.Points(cloud, pointMaterial);
      } else object = new THREE.Mesh(geometry, material);
      object.position.set(x, y, z);
      object.rotation.x = rotation;
      group.add(object);
    }
    const base = new THREE.Shape();
    base.moveTo(-2.25, -1.65);
    base.lineTo(2.25, -1.65);
    base.lineTo(2.25, 1.65);
    base.lineTo(-2.25, 1.65);
    base.closePath();
    for (const x of [-1.9, 1.9])
      for (const y of [-1.3, 1.3]) {
        const hole = new THREE.Path();
        hole.absarc(x, y, 0.16, 0, Math.PI * 2, true);
        base.holes.push(hole);
      }
    add(
      new THREE.ExtrudeGeometry(base, {
        depth: 0.28,
        bevelEnabled: true,
        bevelSize: 0.065,
        bevelThickness: 0.05,
        bevelSegments: 3,
        steps: 5,
        curveSegments: 32,
      }),
      0,
      -0.7,
      0,
      -Math.PI / 2,
    );
    const upright = new THREE.Shape();
    upright.moveTo(-1.5, 0);
    upright.lineTo(1.5, 0);
    upright.lineTo(1.15, 1.8);
    upright.quadraticCurveTo(1, 2.6, 0, 2.6);
    upright.quadraticCurveTo(-1, 2.6, -1.15, 1.8);
    upright.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 1.6, 0.65, 0, Math.PI * 2, true);
    upright.holes.push(hole);
    for (const z of [-1, 0.7])
      add(
        new THREE.ExtrudeGeometry(upright, {
          depth: 0.32,
          bevelEnabled: true,
          bevelSize: 0.05,
          bevelThickness: 0.04,
          bevelSegments: 3,
          steps: 6,
          curveSegments: 48,
        }),
        0,
        -0.4,
        z,
      );
    group.rotation.y = -0.25;
    function draw() {
      const { width, height } = element!.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position
        .set(7, 5.8, 8)
        .multiplyScalar(width / height < 1 ? 1.25 : 1);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    const resize = new ResizeObserver(draw);
    resize.observe(element);
    draw();
    return () => {
      resize.disconnect();
      geometries.forEach((g) => g.dispose());
      material.dispose();
      lineMaterial.dispose();
      pointMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode]);
  return (
    <div
      className="part-scene"
      ref={host}
      role="img"
      aria-label={
        mode === "wire"
          ? "Fikstürün temsili CAD çizgileri"
          : mode === "points"
            ? "Fikstürün temsili nokta bulutu"
            : "Mavi üretim fikstürünün temsili 3D modeli"
      }
    >
      {failed && (
        <img
          src="/brand/industrial/fixture.webp"
          alt="Temsili üretim fikstürü"
        />
      )}
    </div>
  );
}
