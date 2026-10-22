import { useEffect, useRef } from "react";
import { BED_HEIGHT, PRINT_LAYERS, printFrame, printPoint } from "./print-path";
import type { PrinterSceneProps } from "./types";

type Point = { x: number; y: number; z: number };
const p = (x: number, y: number, z: number): Point => ({ x, y, z });
const tau = Math.PI * 2;

/** A projected, layered drawing for devices without accelerated WebGL.
 * Static machine surfaces and deposited layers are cached; only the head moves each frame.
 */
export default function CanvasPrinter({ paused, restart, onReady, onFailure, onState }: PrinterSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const running = useRef(!paused);
  const callbacks = useRef({ onReady, onFailure, onState });
  const controls = useRef<{ resume: () => void; restart: () => void }>();
  const previousRestart = useRef(restart);
  callbacks.current = { onReady, onFailure, onState };
  useEffect(() => { running.current = !paused; controls.current?.resume(); }, [paused]);
  useEffect(() => { if (restart !== previousRestart.current) { previousRestart.current = restart; controls.current?.restart(); } }, [restart]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const canvas = document.createElement("canvas"), rear = document.createElement("canvas"), front = document.createElement("canvas"), part = document.createElement("canvas");
    const ctx = canvas.getContext("2d"), back = rear.getContext("2d"), fore = front.getContext("2d"), wall = part.getContext("2d");
    if (!ctx || !back || !fore || !wall) { callbacks.current.onFailure(); return; }
    canvas.setAttribute("aria-hidden", "true"); el.appendChild(canvas);
    let width = 0, height = 0, scale = 1, dpr = 1, elapsed = running.current ? 10.8 : 44;
    let visible = true, disposed = false, raf = 0, last = 0, lastLayer = -1, lastLabel = "", announced = false;
    const project = ({ x, y, z }: Point) => ({ x: width * .47 + (x * .86 - z * .51) * scale, y: height * .84 + (-y * .95 + x * .17 + z * .29) * scale });
    const path = (c: CanvasRenderingContext2D, points: Point[], close = false) => {
      c.beginPath(); points.forEach((point, i) => { const q = project(point); if (i) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }); if (close) c.closePath();
    };
    const poly = (c: CanvasRenderingContext2D, points: Point[], color: string, stroke?: string) => { path(c, points, true); c.fillStyle = color; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = .5; c.stroke(); } };
    const line = (c: CanvasRenderingContext2D, points: Point[], color: string, thickness = 1) => { path(c, points); c.strokeStyle = color; c.lineWidth = thickness; c.stroke(); };
    const box = (c: CanvasRenderingContext2D, x: number, y: number, z: number, w: number, h: number, d: number, colors = ["#546168", "#29343b", "#3c484f"]) => {
      const a = x - w / 2, b = x + w / 2, l = z - d / 2, r = z + d / 2, bottom = y - h / 2, top = y + h / 2;
      poly(c, [p(a,bottom,r),p(b,bottom,r),p(b,top,r),p(a,top,r)], colors[1]);
      poly(c, [p(b,bottom,l),p(b,bottom,r),p(b,top,r),p(b,top,l)], colors[2]);
      poly(c, [p(a,top,l),p(b,top,l),p(b,top,r),p(a,top,r)], colors[0]);
      line(c, [p(a,top,r),p(b,top,r),p(b,top,l)], "#a8b7bf4d", .6);
    };
    const ring = (c: CanvasRenderingContext2D, x: number, y: number, z: number, radius: number, color: string, thickness: number) => {
      line(c, Array.from({length: 65}, (_, i) => p(x, y + Math.cos(i / 64 * tau) * radius, z + Math.sin(i / 64 * tau) * radius)), color, thickness * scale);
    };
    const clear = (c: CanvasRenderingContext2D) => c.clearRect(0, 0, width, height);
    const staticMachine = () => {
      clear(back); clear(fore);
      back.save(); back.translate(width * .49, height * .87); back.scale(1, .27);
      const shadow = back.createRadialGradient(0, 0, scale * .3, 0, 0, scale * 2.8); shadow.addColorStop(0, "#30372f35"); shadow.addColorStop(.5, "#30372f15"); shadow.addColorStop(1, "#30372f00"); back.fillStyle = shadow; back.fillRect(-scale * 3, -scale * 3, scale * 6, scale * 6); back.restore();
      box(back, 0, 2, -1.29, 3, 2.9, .04, ["#89969d", "#d4dcdd", "#9eacb2"]);
      for (const x of [-1.56, 1.56]) {
        box(back, x, 2.05, -1.25, .16, 3.12, .16);
        box(back, x, .07, -1.25, .3, .14, .3);
        line(back, [p(x * .76, .59, -1.12), p(x * .76, 3.45, -1.12)], "#a5b4ba", 3);
        line(back, [p(x * .76 + .014, .59, -1.12), p(x * .76 + .014, 3.45, -1.12)], "#f5f8f7", .7);
      }
      box(back, 0, 3.62, -1.25, 3.28, .19, .19);
      box(back, 1.56, 3.62, 0, .19, .19, 2.69);
      // The externally mounted spool and its five spokes.
      box(back, 1.8, 2.75, -.6, .64, .09, .1);
      ring(back, 2.08, 2.75, -.6, .37, "#c75626", .22);
      ring(back, 2.2, 2.75, -.6, .51, "#35434c", .045);
      ring(back, 2.2, 2.75, -.6, .13, "#35434c", .07);
      for (let i = 0; i < 5; i++) { const a = i / 5 * tau; line(back, [p(2.2,2.75+Math.cos(a)*.15,-.6+Math.sin(a)*.15),p(2.2,2.75+Math.cos(a)*.49,-.6+Math.sin(a)*.49)], "#48565e", .035 * scale); }
      for (const x of [-1.56,1.56]) box(back,x,.07,1.25,.3,.14,.3);
      box(back,0,.28,0,3.55,.38,2.95);
      box(back,0,.49,0,3.38,.05,2.8,["#89969c","#55636c","#657680"]);
      box(back,0,.535,0,2.8,.04,2.4,["#46545a","#26343a","#44535c"]);
      for (let i = -5; i <= 5; i++) {
        line(back,[p(i*.24,.562,-1.08),p(i*.24,.562,1.08)],"#91a4a54d",.6);
        line(back,[p(-1.24,.562,i*.2),p(1.24,.562,i*.2)],"#91a4a54d",.6);
      }
      // Soft translucent enclosure is behind the animated print.
      poly(back,[p(1.56,.57,-1.15),p(1.56,3.48,-1.15),p(1.56,3.48,1.15),p(1.56,.57,1.15)],"#9eb7c015");
      for (const x of [-1.56,1.56]) {
        box(fore,x,2.05,1.25,.16,3.12,.16);
        line(fore,[p(x-.035,.61,1.338),p(x-.035,3.48,1.338)],"#92a2ac80",.8);
        for (let i = 0; i < 6; i++) { const q=project(p(x,.7+i*.51,1.343)); fore.fillStyle="#c5d0d3"; fore.beginPath(); fore.arc(q.x,q.y,1.1,0,tau); fore.fill(); }
      }
      box(fore,-1.56,3.62,0,.19,.19,2.69);
      box(fore,0,3.62,1.25,3.28,.19,.19);
      line(fore,[p(-1.32,3.5,1.25),p(1.32,3.5,1.25)],"#e4f4e4",1.5);
      // A small physical label is part of the housing, not UI telemetry.
      poly(fore,[p(-1.4,.16,1.48),p(.25,.16,1.48),p(.25,.4,1.48),p(-1.4,.4,1.48)],"#1b262c");
      const label=project(p(-1.27,.24,1.49)); fore.save(); fore.translate(label.x,label.y); fore.rotate(.194); fore.fillStyle="#e1e6e5"; fore.font=`600 ${Math.max(6,scale*.085)}px Arial`; fore.fillText("3D YANIMDA",0,0); fore.restore();
      line(fore,[p(.04,.28,1.49),p(.18,.28,1.49)],"#ee7740",2);
    };
    const drawPart = (layer: number) => {
      clear(wall);
      if (!layer) return;
      const progress = layer / PRINT_LAYERS;
      const segments = 96;
      const strips = Array.from({length:segments},(_,i) => ({i,a:(i+.5)/segments*tau})).sort((a,b) => (Math.cos(a.a)*.51+Math.sin(a.a)*.86)-(Math.cos(b.a)*.51+Math.sin(b.a)*.86));
      // Vertical strips expose the fluted silhouette; lambert shading and layer lines add depth.
      for (const {i,a} of strips) {
        const points: Point[]=[];
        for(let row=0;row<=layer;row++) points.push(printPoint(row/PRINT_LAYERS,i/segments*tau));
        for(let row=layer;row>=0;row--) points.push(printPoint(row/PRINT_LAYERS,(i+1)/segments*tau));
        const light = 49 + 12*Math.cos(a-2.5) + 4*Math.sin(a*12-progress*4.8);
        poly(wall,points,`hsl(21 78% ${light}%)`);
      }
      // The open rim stays hollow, with a shaded interior and a fresh filament edge.
      const rim=Array.from({length:97},(_,i)=>printPoint(progress,i/96*tau));
      poly(wall,rim,"#9b3c1d");
      line(wall,rim,"#ffb467",Math.max(1,scale*.027));
      for(let row=1;row<=layer;row++) {
        const points:Point[]=[];
        for(let i=0;i<=48;i++) { const a=-.535+i/48*Math.PI; points.push(printPoint(row/PRINT_LAYERS,a)); }
        line(wall,points,"#7c321c40",.55);
      }
      lastLayer = layer;
    };
    const drawHead = (head: Point, lift: number, printing: boolean) => {
      const h = head.y + lift;
      box(ctx,0,h+.42,head.z-.1,3.1,.13,.12);
      for(const offset of [.34,.5]) line(ctx,[p(-1.49,h+offset,head.z),p(1.49,h+offset,head.z)],"#b7c4c9",1.8);
      for(const x of [-1.5,1.5]) box(ctx,x,h+.43,head.z,.18,.31,.27);
      const cable:Point[]=[];
      for(let i=0;i<=24;i++) { const t=i/24,v=1-t; cable.push(p(v*v*1.65+2*v*t*1.1+t*t*head.x,v*v*3.55+2*v*t*4.2+t*t*(h+.66),v*v*(-.7)+2*v*t*(-.3)+t*t*head.z)); }
      line(ctx,cable,"#465159",2.5); line(ctx,cable,"#8e9c9e",.6);
      box(ctx,head.x,h+.4,head.z,.47,.45,.43,["#79858b","#38444c","#58666f"]);
      box(ctx,head.x,h+.43,head.z+.23,.33,.27,.025,["#3c474d","#202b32","#39474e"]);
      const center=project(p(head.x,h+.43,head.z+.26)); ctx.save(); ctx.translate(center.x,center.y); ctx.transform(.86,.17,0,.95,0,0); ctx.strokeStyle="#8b9a9f"; ctx.lineWidth=2; ctx.beginPath();ctx.arc(0,0,scale*.09,0,tau);ctx.stroke();ctx.fillStyle="#53656e";ctx.beginPath();ctx.arc(0,0,scale*.035,0,tau);ctx.fill();ctx.restore();
      box(ctx,head.x,h+.13,head.z,.18,.1,.18,["#c7cfd0","#889a9d","#a7b7bb"]);
      poly(ctx,[p(head.x-.073,h+.08,head.z),p(head.x+.073,h+.08,head.z),p(head.x,h,head.z)],"#cfaa71");
      if(printing) { const q=project(head); const glow=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,scale*.09);glow.addColorStop(0,"#ffdc8d");glow.addColorStop(1,"#ff9b4400");ctx.fillStyle=glow;ctx.fillRect(q.x-scale*.1,q.y-scale*.1,scale*.2,scale*.2); }
    };
    const paint = () => {
      if(disposed || !width || !visible || document.hidden) return;
      const frame=printFrame(elapsed), layer=Math.max(1,Math.ceil(frame.progress*PRINT_LAYERS));
      if(layer!==lastLayer) drawPart(layer);
      clear(ctx); ctx.drawImage(rear,0,0,width,height);
      ctx.save();ctx.globalAlpha=frame.opacity;ctx.drawImage(part,0,0,width,height);ctx.restore();
      drawHead(frame.head,frame.lift,frame.phase==="printing"); ctx.drawImage(front,0,0,width,height);
      const label=`${frame.phase}:${frame.layer}`;
      if(label!==lastLabel) { lastLabel=label; callbacks.current.onState({layer:frame.layer,total:PRINT_LAYERS,phase:frame.phase}); }
      if(!announced) { announced=true; callbacks.current.onReady(); }
    };
    const fit=()=>{
      const rect=el.getBoundingClientRect(); width=rect.width;height=rect.height;if(!width||!height)return;
      dpr=Math.min(window.devicePixelRatio||1,1.5);scale=Math.min(width/5.6,height/5.15);
      for(const surface of [canvas,rear,front,part]) {surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);surface.getContext("2d")!.setTransform(dpr,0,0,dpr,0,0);}
      lastLayer=-1;staticMachine();paint();
    };
    const tick=(now:number)=>{raf=0;if(disposed||!running.current||!visible||document.hidden)return;if(now-last>=1000/24){elapsed+=Math.min((now-last)/1000,.1);last=now;paint();}raf=requestAnimationFrame(tick);};
    const resume=()=>{cancelAnimationFrame(raf);raf=0;if(disposed)return;el.dataset.motion=!visible||document.hidden?"suspended":running.current?"playing":"paused";paint();if(running.current&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick);}};
    controls.current={resume,restart:()=>{elapsed=0;lastLabel="";resume();}};
    const resize=new ResizeObserver(fit);resize.observe(el);
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();},{threshold:.02});intersection.observe(el);
    document.addEventListener("visibilitychange",resume);fit();resume();
    return()=>{disposed=true;cancelAnimationFrame(raf);controls.current=undefined;resize.disconnect();intersection.disconnect();document.removeEventListener("visibilitychange",resume);canvas.remove();for(const surface of [canvas,rear,front,part]){surface.width=surface.height=0;}};
  },[]);
  return <div ref={host} className="printer-scene" data-renderer="canvas" role="img" aria-label="3D yazıcının turuncu, kıvrımlı bir formu katman katman ürettiği temsili animasyon" />;
}
