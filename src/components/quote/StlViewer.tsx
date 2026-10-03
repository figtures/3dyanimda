import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type StlMetrics = {
  volumeCm3: number; // gerçek mesh hacmi (cm³)
  bboxCm: { x: number; y: number; z: number };
  surfaceCm2: number;
  triangles: number;
};

type Props = {
  file: File | null;
  color?: string; // hex
  onMetrics?: (m: StlMetrics) => void;
  className?: string;
};

/** Mesh hacmi — signed tetrahedron toplamı. Birim: input mm ise mm³ döner. */
function computeVolumeMM3(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  let vol = 0;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    vol += a.dot(b.clone().cross(c)) / 6;
  }
  return Math.abs(vol);
}

function computeSurfaceMM2(geometry: THREE.BufferGeometry): number {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  let area = 0;
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3();
  const ab = new THREE.Vector3(),
    ac = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    area += ab.cross(ac).length() / 2;
  }
  return area;
}

export const StlViewer = ({
  file,
  color = "#3b82f6",
  onMetrics,
  className,
}: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const w = mount.clientWidth,
      h = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 5000);
    camera.up.set(0, 0, 1);
    camera.position.set(120, -160, 100);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(
        "3D önizleme bu tarayıcıda açılamadı. Dosyanızı yine de teknik incelemeye gönderebilirsiniz.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights — studio
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(120, 200, 140);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9bb6ff, 0.45);
    fill.position.set(-150, 60, -80);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(0, -80, -120);
    scene.add(rim);

    // Floor (subtle shadow catcher)
    const floorGeo = new THREE.CircleGeometry(400, 64);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    // CircleGeometry already lies in the XY plane.
    floor.position.z = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(600, 30, 0x6b7a99, 0x2a3550);
    grid.rotation.x = Math.PI / 2;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 30;
    controls.maxDistance = 1200;
    controls.target.set(0, 0, 30);
    controlsRef.current = controls;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount || !rendererRef.current || !cameraRef.current) return;
      const W = mount.clientWidth,
        H = mount.clientHeight;
      rendererRef.current.setSize(W, H);
      cameraRef.current.aspect = W / H;
      cameraRef.current.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if ((m.material as THREE.Material)?.dispose)
          (m.material as THREE.Material).dispose();
      });
    };
  }, []);

  // Update color
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    (mesh.material as THREE.MeshStandardMaterial).color.set(color);
  }, [color]);

  // Load file
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !controls) return;

    // Remove existing
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }
    if (!file) return;

    setLoading(true);
    setError(null);
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (cancelled) return;
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const loader = new STLLoader();
        const geometry = loader.parse(buffer);
        const positions = geometry.getAttribute("position");
        if (
          !positions ||
          positions.count < 3 ||
          positions.count % 3 !== 0 ||
          !Array.from(positions.array).every(Number.isFinite)
        ) {
          geometry.dispose();
          throw new Error("Invalid mesh");
        }
        geometry.computeVertexNormals();
        geometry.center();

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness: 0.15,
          roughness: 0.55,
          flatShading: false,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Preserve file axes. Camera and ground use Z-up; never rotate the STL.

        // Auto-fit
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        // Move so it sits on grid
        mesh.position.sub(center);
        mesh.position.z += size.z / 2;

        scene.add(mesh);
        meshRef.current = mesh;

        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 2.2 + 40;
        camera.position.set(dist * 0.7, -dist, dist * 0.55);
        controls.target.set(0, 0, size.z / 2);
        controls.update();

        // Metrics — STL units assumed mm
        const volMM3 = computeVolumeMM3(geometry);
        const surfMM2 = computeSurfaceMM2(geometry);
        const metrics: StlMetrics = {
          volumeCm3: volMM3 / 1000,
          bboxCm: { x: size.x / 10, y: size.y / 10, z: size.z / 10 },
          surfaceCm2: surfMM2 / 100,
          triangles: geometry.attributes.position.count / 3,
        };
        // Keep dimensions in the original file axes.
        const rawBox = new THREE.Box3().setFromBufferAttribute(
          geometry.attributes.position as THREE.BufferAttribute,
        );
        const rawSize = new THREE.Vector3();
        rawBox.getSize(rawSize);
        metrics.bboxCm = {
          x: rawSize.x / 10,
          y: rawSize.y / 10,
          z: rawSize.z / 10,
        };

        if (
          !Number.isFinite(metrics.volumeCm3) ||
          metrics.volumeCm3 <= 0 ||
          !Object.values(metrics.bboxCm).every(
            (v) => Number.isFinite(v) && v > 0,
          )
        )
          throw new Error("Degenerate mesh");
        onMetrics?.(metrics);
      } catch (err) {
        console.error(err);
        setError(
          "STL dosyası okunamadı. Dosyanın geçerli olduğundan emin olun.",
        );
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Dosya okunamadı.");
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
    return () => {
      cancelled = true;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className={className}>
      <div ref={mountRef} className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-xs font-mono uppercase tracking-widest text-cream/70 bg-accent-blue-deep/40 backdrop-blur-sm">
            STL yükleniyor…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center text-sm text-destructive p-6 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default StlViewer;
