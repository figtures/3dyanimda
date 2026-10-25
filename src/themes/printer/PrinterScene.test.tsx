import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PrinterScene from "./PrinterScene";

const state = vi.hoisted(() => ({
  render: vi.fn(), rendererDispose: vi.fn(), forceContextLoss: vi.fn(), modelDispose: vi.fn(), modelUpdate: vi.fn(), environmentDispose: vi.fn(),
  setSize: vi.fn(), setPixelRatio: vi.fn(), compile: vi.fn(),
  compilation: undefined as unknown as Promise<unknown>,
  resolve: undefined as unknown as () => void, reject: undefined as unknown as (error: Error) => void,
  resize: undefined as unknown as () => void, intersect: undefined as unknown as (entries: { isIntersecting: boolean }[]) => void,
  resizeDisconnect: vi.fn(), intersectionDisconnect: vi.fn(), width: 700, hidden: false,
}));

vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");
  return {
    ...actual,
    WebGLRenderer: class {
      domElement: HTMLCanvasElement;
      constructor({ canvas }: { canvas: HTMLCanvasElement }) { this.domElement = canvas; }
      setClearColor() {}
      setPixelRatio = state.setPixelRatio;
      setSize = state.setSize;
      render = state.render;
      dispose = state.rendererDispose;
      forceContextLoss = state.forceContextLoss;
      compileAsync(scene: unknown, camera: unknown) { state.compile(scene, camera); return state.compilation; }
    },
    PMREMGenerator: class {
      fromScene() { return { texture: new actual.Texture(), dispose: state.environmentDispose }; }
      dispose() {}
    },
  };
});
vi.mock("three/examples/jsm/environments/RoomEnvironment.js", async () => {
  const { Scene } = await vi.importActual<typeof import("three")>("three");
  return { RoomEnvironment: class extends Scene { dispose() {} } };
});
vi.mock("./build-printer", async () => {
  const { Group } = await vi.importActual<typeof import("three")>("three");
  return { buildPrinter: () => ({ root: new Group(), update: state.modelUpdate, dispose: state.modelDispose }) };
});

let clock = 1000, nextFrame = 0;
const frames = new Map<number, FrameRequestCallback>();
const frame = (delta = 34) => {
  clock += delta;
  const pending = [...frames.values()]; frames.clear();
  act(() => { pending.forEach(callback => callback(clock)); });
};
const complete = async () => { await act(async () => { state.resolve(); await state.compilation; }); };
const props = () => ({ paused: false, restart: 0, onReady: vi.fn(), onFailure: vi.fn(), onState: vi.fn() });

beforeEach(() => {
  vi.clearAllMocks(); frames.clear(); clock = 1000; nextFrame = 0; state.width = 700; state.hidden = false;
  state.render.mockReset();
  state.compilation = new Promise((resolve, reject) => { state.resolve = () => resolve(undefined); state.reject = reject; });
  vi.spyOn(performance, "now").mockImplementation(() => clock);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ({}) as never);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ width: state.width, height: 500, top: 0, left: 0, bottom: 500, right: state.width, x: 0, y: 0, toJSON() {} }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => state.hidden);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { const id = ++nextFrame; frames.set(id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class { constructor(callback: () => void) { state.resize = callback; } observe() {} disconnect = state.resizeDisconnect; });
  vi.stubGlobal("IntersectionObserver", class { constructor(callback: typeof state.intersect) { state.intersect = callback; } observe() {} disconnect = state.intersectionDisconnect; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("precompiles the complete lit scene and coalesces startup observer notifications into one first frame", async () => {
  const callbacks = props(); render(<PrinterScene {...callbacks} />);
  const scene = state.compile.mock.calls[0][0];
  expect(scene.environment).toBeTruthy();
  expect(scene.children.filter((child: { isLight?: boolean }) => child.isLight)).toHaveLength(4);
  act(() => { state.resize(); state.resize(); state.intersect([{ isIntersecting: true }]); });
  expect(state.render).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
  await complete(); expect(frames.size).toBe(1);
  frame(); expect(state.render).toHaveBeenCalledTimes(1); expect(callbacks.onReady).toHaveBeenCalledTimes(1);
  expect(state.setSize).toHaveBeenCalledTimes(1);
  frame(10); expect(state.render).toHaveBeenCalledTimes(1);
  frame(24); expect(state.render).toHaveBeenCalledTimes(2);
});

it("honors a pause and restart requested before shader compilation completes", async () => {
  const callbacks = props(); const view = render(<PrinterScene {...callbacks} />);
  view.rerender(<PrinterScene {...callbacks} paused restart={1} />);
  await complete(); frame();
  expect(state.modelUpdate.mock.calls[0][0]).toBe(0);
  expect(callbacks.onState).toHaveBeenLastCalledWith({ layer: 0, total: 72, phase: "printing" });
  expect(frames.size).toBe(0);
  view.rerender(<PrinterScene {...callbacks} restart={1} />);
  frame(); expect(state.modelUpdate.mock.calls.at(-1)?.[0]).toBeGreaterThan(0);
});

it("keeps a reduced-motion initial pose still after the single ready frame", async () => {
  const callbacks = props(); render(<PrinterScene {...callbacks} paused />);
  await complete(); frame();
  expect(callbacks.onState).toHaveBeenLastCalledWith({ layer: 72, total: 72, phase: "complete" });
  expect(state.render).toHaveBeenCalledTimes(1); expect(frames.size).toBe(0);
});

it("does not paint when hidden or offscreen at compilation completion, and resumes once visible", async () => {
  const callbacks = props(); render(<PrinterScene {...callbacks} />);
  act(() => state.intersect([{ isIntersecting: false }]));
  await complete(); expect(frames.size).toBe(0); expect(callbacks.onReady).not.toHaveBeenCalled();
  state.hidden = true;
  act(() => state.intersect([{ isIntersecting: true }]));
  expect(frames.size).toBe(0);
  state.hidden = false; act(() => document.dispatchEvent(new Event("visibilitychange")));
  frame(); expect(state.render).toHaveBeenCalledTimes(1);
  state.hidden = true; act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(frames.size).toBe(0);
});

it("detaches immediately on pending unmount and disposes GPU resources once compilation settles", async () => {
  const callbacks = props(); const view = render(<PrinterScene {...callbacks} />);
  view.unmount();
  expect(document.querySelector(".printer-scene canvas")).toBeNull();
  expect(state.resizeDisconnect).toHaveBeenCalled(); expect(state.intersectionDisconnect).toHaveBeenCalled();
  expect(state.modelDispose).not.toHaveBeenCalled(); expect(state.rendererDispose).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
  await complete();
  expect(state.modelDispose).toHaveBeenCalledTimes(1); expect(state.environmentDispose).toHaveBeenCalledTimes(1);
  expect(state.rendererDispose).toHaveBeenCalledTimes(1); expect(state.forceContextLoss).toHaveBeenCalledTimes(1);
  expect(callbacks.onReady).not.toHaveBeenCalled(); expect(callbacks.onFailure).not.toHaveBeenCalled(); expect(state.render).not.toHaveBeenCalled();
});

it("falls back once on rejected compilation without painting and releases resources", async () => {
  const callbacks = props(); const view = render(<PrinterScene {...callbacks} />);
  await act(async () => { state.reject(new Error("shader failure")); await state.compilation.catch(() => {}); });
  expect(callbacks.onFailure).toHaveBeenCalledTimes(1); expect(callbacks.onReady).not.toHaveBeenCalled();
  expect(state.render).not.toHaveBeenCalled(); expect(frames.size).toBe(0); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
  view.unmount(); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
});

it("cleans up a synchronous compilation exception through the same fallback", () => {
  const callbacks = props(); state.compile.mockImplementationOnce(() => { throw new Error("compile failed"); });
  render(<PrinterScene {...callbacks} />);
  expect(callbacks.onFailure).toHaveBeenCalledTimes(1); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
  expect(state.render).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
});

it("stops listeners and frames immediately on context loss while compilation is pending", async () => {
  const callbacks = props(); const view = render(<PrinterScene {...callbacks} />);
  const event = new Event("webglcontextlost", { cancelable: true });
  act(() => view.container.querySelector("canvas")!.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true); expect(callbacks.onFailure).toHaveBeenCalledTimes(1);
  expect(state.resizeDisconnect).toHaveBeenCalled(); expect(state.intersectionDisconnect).toHaveBeenCalled(); expect(frames.size).toBe(0);
  await complete(); frame();
  expect(state.render).not.toHaveBeenCalled(); expect(callbacks.onReady).not.toHaveBeenCalled(); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
});

it("releases a ready scene on context loss and ignores queued resize notifications", async () => {
  const callbacks = props(); const view = render(<PrinterScene {...callbacks} />);
  await complete(); frame();
  act(() => view.container.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  state.width = 400; act(() => state.resize()); frame();
  expect(callbacks.onFailure).toHaveBeenCalledTimes(1); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
  expect(state.setSize).toHaveBeenCalledTimes(1); expect(state.render).toHaveBeenCalledTimes(1); expect(frames.size).toBe(0);
});

it("falls back and stops scheduling if the first actual render fails", async () => {
  const callbacks = props(); render(<PrinterScene {...callbacks} />);
  state.render.mockImplementationOnce(() => { throw new Error("render failed"); });
  await complete(); frame();
  expect(callbacks.onFailure).toHaveBeenCalledTimes(1); expect(callbacks.onReady).not.toHaveBeenCalled();
  expect(frames.size).toBe(0); expect(state.rendererDispose).toHaveBeenCalledTimes(1);
});
