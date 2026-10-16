import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, Box } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type { ModelMetrics as StlMetrics } from "@/lib/model-import/types";
import type { ModelMetrics } from "@/lib/model-import/types";
import { importModel } from "@/lib/model-import/client";
type Props = { file:File | null; color?:string; onMetrics?:(m:ModelMetrics | null)=>void; className?:string };
function disposeModel(group:THREE.Group) {
  group.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) material.dispose();
  });
}

export const StlViewer = ({
  file,
  color,
  onMetrics,
  className,
}: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const colorRef = useRef(color);
  colorRef.current = color;
  const [warnings, setWarnings] = useState<string[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const [wireframe, setWireframe] = useState(false);
  function zoom(factor: number) {
    const camera = cameraRef.current, controls = controlsRef.current;
    if (!camera || !controls) return;
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length() * factor)));
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }
  useEffect(() => {
    modelRef.current?.traverse(node => {
      if (node instanceof THREE.Mesh) (node.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    });
  }, [wireframe]);
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

  // Source colors are retained until a production color is explicitly selected.
  useEffect(() => {
    modelRef.current?.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      const material=node.material as THREE.MeshStandardMaterial;
      material.vertexColors=!color && !!node.geometry.getAttribute('color');
      material.color.set(color || node.userData.sourceColor);
      material.needsUpdate=true;
    });
  }, [color]);

  useEffect(() => {
    const scene=sceneRef.current, camera=cameraRef.current, controls=controlsRef.current;
    if(!scene || !camera || !controls)return;
    if(modelRef.current){scene.remove(modelRef.current);disposeModel(modelRef.current);modelRef.current=null;}
    onMetrics?.(null);setWarnings([]);setWireframe(false);setError(null);
    if(!file){setLoading(false);return;}
    const abort=new AbortController();setLoading(true);
    importModel(file,abort.signal).then(result=>{
      if(abort.signal.aborted)return;
      const group=new THREE.Group();group.userData.fileName=file.name;
      try {
        for(const part of result.parts) {
          const geometry=new THREE.BufferGeometry();
          geometry.setAttribute('position',new THREE.BufferAttribute(part.positions,3));
          if(part.colors)geometry.setAttribute('color',new THREE.BufferAttribute(part.colors,3));
          geometry.computeVertexNormals();
          const sourceColor=part.colors?'#ffffff':part.color?new THREE.Color(...part.color).getHexString():'#3b82f6';
          const normalizedColor=typeof sourceColor==='string'&&!sourceColor.startsWith('#')?'#'+sourceColor:sourceColor;
          const material=new THREE.MeshStandardMaterial({color:colorRef.current||normalizedColor,vertexColors:!colorRef.current&&!!part.colors,metalness:0.12,roughness:0.6,side:THREE.DoubleSide});
          const mesh=new THREE.Mesh(geometry,material);mesh.name=part.name;mesh.userData.sourceColor=normalizedColor;
          mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
        }
        const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
        group.position.set(-center.x,-center.y,-box.min.z);
        scene.add(group);modelRef.current=group;
        const maxDim=Math.max(size.x,size.y,size.z),dist=Math.max(maxDim*2.2,1);
        camera.near=Math.max(dist/10000,0.001);camera.far=Math.max(dist*50,5000);camera.updateProjectionMatrix();
        camera.position.set(dist*0.7,-dist,dist*0.55);
        controls.minDistance=Math.max(maxDim*0.03,0.01);controls.maxDistance=Math.max(dist*10,100);
        controls.target.set(0,0,size.z/2);controls.update();controls.saveState();
        onMetrics?.(result.metrics);setWarnings(result.warnings);
      } catch(error) {scene.remove(group);disposeModel(group);modelRef.current=null;throw error;}
    }).catch(error=>{
      if(!abort.signal.aborted){onMetrics?.(null);setError(error instanceof Error?error.message:'Model okunamadı.');}
    }).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    return ()=>abort.abort();
  }, [file,onMetrics]);

  return (
    <div className={`studio-viewer ${className || ""}`} data-model-file={modelRef.current?.userData.fileName} data-model-state={loading ? "loading" : error ? "error" : modelRef.current ? "ready" : "empty"}>
      <div ref={mountRef} className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-xs font-mono uppercase tracking-widest text-cream/70 bg-accent-blue-deep/40 backdrop-blur-sm">
            Model hazırlanıyor…
          </div>
        )}
        {error && (
          <div role="alert" className="absolute inset-0 grid place-items-center text-sm text-destructive p-6 text-center bg-white/95">
            {error}
          </div>
        )}
      </div>
      {warnings.length > 0 && <span className="studio-viewer-note" role="status">{warnings.join(" ")}</span>}
      {file && modelRef.current && !loading && !error && <div className="studio-viewer-tools" role="group" aria-label="Model görünümü">
        <button type="button" onClick={() => zoom(0.8)} aria-label="Modeli yakınlaştır" title="Yakınlaştır"><Plus size={16}/></button>
        <button type="button" onClick={() => zoom(1.25)} aria-label="Modeli uzaklaştır" title="Uzaklaştır"><Minus size={16}/></button>
        <button type="button" onClick={() => controlsRef.current?.reset()} aria-label="Model görünümünü sıfırla" title="Görünümü sıfırla"><RotateCcw size={16}/></button>
        <button type="button" onClick={() => setWireframe(v => !v)} aria-label="Tel kafes görünümü" aria-pressed={wireframe} title="Tel kafes"><Box size={16}/></button>
      </div>}
    </div>
  );
};

export default StlViewer;
