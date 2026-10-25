import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildPrinter } from "./build-printer";
import { PRINT_LAYERS, printFrame } from "./print-path";
import type { PrinterSceneProps } from "./types";

// Defined only by the isolated diagnostic lab, never by a VITE_* deployment env.
const diagnostic = import.meta.env.PRINTER_DIAGNOSTICS === true;
const mark = (phase: string) => { if (diagnostic) performance.mark(`3dy:printer:${phase}`); };
const measure = (phase: string) => { if (diagnostic) performance.measure(`3dy:printer:${phase}`, `3dy:printer:${phase}:start`, `3dy:printer:${phase}:end`); };

export default function PrinterScene({ paused, restart, onReady, onFailure, onState }: PrinterSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const running = useRef(!paused);
  const callbacks = useRef({ onReady, onFailure, onState });
  const control = useRef<{ resume: () => void; restart: () => void }>();
  const previousRestart = useRef(restart);
  callbacks.current = { onReady, onFailure, onState };
  useEffect(() => { running.current = !paused; control.current?.resume(); }, [paused]);
  useEffect(() => { if (previousRestart.current !== restart) { previousRestart.current = restart; control.current?.restart(); } }, [restart]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    mark("startup:start");
    let renderer: THREE.WebGLRenderer;
    const canvas = document.createElement("canvas");
    const options: WebGLContextAttributes = { alpha: true, antialias: true, powerPreference: "low-power" };
    mark("context:start");
    const context = canvas.getContext("webgl2", options) || canvas.getContext("webgl", options);
    mark("context:end"); measure("context");
    if (!context) { callbacks.current.onFailure(); return; }
    try { mark("renderer:start"); renderer = new THREE.WebGLRenderer({ canvas, context, ...options }); mark("renderer:end"); measure("renderer"); }
    catch { callbacks.current.onFailure(); return; }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
    let model: ReturnType<typeof buildPrinter>;
    let environmentTexture: THREE.WebGLRenderTarget;
    try {
      mark("environment:start");
      const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
      mark("pmrem:start");
      environmentTexture = pmrem.fromScene(room, .07); scene.environment = environmentTexture.texture; room.dispose(); pmrem.dispose();
      mark("pmrem:end"); measure("pmrem"); mark("environment:end"); measure("environment");
      mark("model:start");
      model = buildPrinter(); scene.add(model.root);
      mark("model:end"); measure("model");
    } catch {
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); callbacks.current.onFailure(); return;
    }
    scene.add(new THREE.HemisphereLight(0xe6f0f4, 0x6b6254, 2.4));
    const key = new THREE.DirectionalLight(0xffead5, 3.6); key.position.set(-3, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xcbdfe8, 2.4); rim.position.set(4, 4, -2); scene.add(rim);
    const light = new THREE.PointLight(0xffe8cc, 3.5, 5); light.position.set(0, 3.3, .8); scene.add(light);

    let disposed = false, failed = false, visible = true, compiled = false, compiling = true, released = false;
    let request = 0, last = performance.now(), elapsed = running.current ? 10.8 : 44, needsPaint = true;
    let lastWidth = 0, lastHeight = 0, lastDpr = 0;
    let announced = false, lastLabel = "", distance = 9, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paint = () => {
      if (disposed || failed || !compiled || !visible || document.hidden) return;
      const pose = printFrame(elapsed);
      model.update(pose.progress, pose.head, pose.opacity, pose.lift, pose.phase === "printing");
      const key = `${pose.phase}:${pose.layer}`;
      if (key !== lastLabel) { lastLabel = key; callbacks.current.onState({ layer: pose.layer, total: PRINT_LAYERS, phase: pose.phase }); }
      pointerX += (targetX - pointerX) * .07; pointerY += (targetY - pointerY) * .07;
      const azimuth = .53 + pointerX * .065, elevation = .29 + pointerY * .035;
      camera.position.set(.2 + Math.sin(azimuth) * distance, 1.8 + elevation * distance, Math.cos(azimuth) * distance);
      camera.lookAt(.2, 1.8, 0);
      if (!announced) mark("first-render:start");
      renderer.render(scene, camera);
      if (!announced) { mark("first-render:end"); measure("first-render"); mark("startup:end"); measure("startup"); }
      if (!announced) { announced = true; callbacks.current.onReady(); }
    };
    const fit = () => {
      const { width, height } = el.getBoundingClientRect(); if (!width || !height || disposed || failed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 580 ? 1.25 : 1.5);
      if (width === lastWidth && height === lastHeight && dpr === lastDpr) return;
      lastWidth = width; lastHeight = height; lastDpr = dpr;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      distance = Math.max(7.7, 4.9 / (2 * Math.tan(THREE.MathUtils.degToRad(17)) * camera.aspect));
      camera.updateProjectionMatrix(); needsPaint = true; schedule();
    };
    const tick = (now: number) => {
      request = 0;
      if (disposed || failed || !compiled || !visible || document.hidden) return;
      if (needsPaint || (running.current && now - last >= 1000 / 30)) {
        if (running.current) elapsed += Math.min((now - last) / 1000, .1);
        last = now; needsPaint = false;
        try { paint(); } catch { fail(); return; }
      }
      schedule();
    };
    const schedule = () => {
      if (!request && !disposed && !failed && compiled && visible && !document.hidden && (needsPaint || running.current)) request = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (disposed || failed) return;
      el.dataset.motion = !visible || document.hidden ? "suspended" : running.current ? "playing" : "paused";
      if (!visible || document.hidden) { cancelAnimationFrame(request); request = 0; return; }
      needsPaint = true; last = performance.now(); schedule();
    };
    control.current = { resume, restart: () => { elapsed = 0; lastLabel = ""; resume(); } };
    const resize = new ResizeObserver(fit); resize.observe(el);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: .02 }); intersection.observe(el);
    const pointer = (event: PointerEvent) => {
      if (motion.matches || event.pointerType !== "mouse") return;
      const box = el.getBoundingClientRect(); targetX = (event.clientX - box.left) / box.width * 2 - 1; targetY = (event.clientY - box.top) / box.height * 2 - 1;
    };
    const leave = () => { targetX = targetY = 0; };
    const detach = () => {
      resize.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", resume);
      el.removeEventListener("pointermove", pointer); el.removeEventListener("pointerleave", leave); renderer.domElement.removeEventListener("webglcontextlost", lost);
    };
    const release = () => {
      if (released) return; released = true;
      model.dispose(); environmentTexture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
    const fail = () => {
      if (disposed || failed) return;
      failed = true; cancelAnimationFrame(request); request = 0; control.current = undefined;
      detach(); renderer.domElement.style.visibility = "hidden";
      if (!compiling) release();
      callbacks.current.onFailure();
    };
    const lost = (event: Event) => { event.preventDefault(); fail(); };
    el.addEventListener("pointermove", pointer); el.addEventListener("pointerleave", leave);
    renderer.domElement.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", resume);
    fit(); resume();
    // Precompile after every light and the environment are configured. The poster
    // remains visible while shader linking completes; observers share one RAF.
    mark("shader-compile:start");
    const settled = () => { compiling = false; mark("shader-compile:end"); measure("shader-compile"); };
    try {
      renderer.compileAsync(scene, camera).then(() => {
        settled();
        if (disposed || failed) { release(); return; }
        compiled = true; resume();
      }, () => { settled(); fail(); release(); });
    } catch { settled(); fail(); release(); }
    return () => {
      disposed = true; cancelAnimationFrame(request); control.current = undefined;
      detach(); renderer.domElement.remove();
      // Three's public compileAsync API has no abort. Keep its GL programs alive
      // until it settles, so an ordinary unmount cannot invalidate pending polls.
      if (!compiling) release();
    };
  }, []);
  return <div className="printer-scene" data-renderer="webgl" ref={host} role="img" aria-label="3D yazıcının turuncu, kıvrımlı bir formu katman katman ürettiği temsili animasyon" />;
}
