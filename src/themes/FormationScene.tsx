import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Original geometries: a radial impeller, fluted vessel and architectural study. */
function objects() {
 const impeller=new THREE.Group(),vessel=new THREE.Group(),architecture=new THREE.Group();
 const copper=new THREE.MeshStandardMaterial({color:0xd98654,metalness:.72,roughness:.3});
 const porcelain=new THREE.MeshStandardMaterial({color:0xe8e2d7,metalness:.08,roughness:.35});
 const stone=new THREE.MeshStandardMaterial({color:0xa8b8c2,metalness:.35,roughness:.38});
 const mesh=(geometry:THREE.BufferGeometry,material:THREE.MeshStandardMaterial,parent:THREE.Group)=>{const m=new THREE.Mesh(geometry,material.clone());parent.add(m);return m;};
 mesh(new THREE.TorusGeometry(.51,.14,16,80),copper,impeller);
 mesh(new THREE.TorusGeometry(1.48,.045,12,100),copper,impeller);
 const blade=new THREE.Shape();blade.moveTo(.49,-.05);blade.bezierCurveTo(.9,-.3,1.45,-.25,1.5,.12);blade.lineTo(1.38,.28);blade.bezierCurveTo(1.24,-.05,.86,.16,.5,.2);blade.closePath();
 const bladeGeometry=new THREE.ExtrudeGeometry(blade,{depth:.36,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:18});bladeGeometry.translate(0,0,-.18);
 for(let i=0;i<9;i++)mesh(bladeGeometry,copper,impeller).rotation.z=i*Math.PI*2/9;
 impeller.rotation.set(-.2,-.28,-.2);impeller.position.set(0,.35,.45);
 const profile:THREE.Vector2[]=[];
 for(let i=0;i<=64;i++){const y=i/64*2.45;const radius=.38+.4*Math.sin(Math.PI*i/64)**1.3+.1*Math.sin(i/64*Math.PI*3);profile.push(new THREE.Vector2(radius,y));}
 const vase=new THREE.LatheGeometry(profile,112);const pos=vase.getAttribute('position');
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);const ripple=1+.055*Math.sin(Math.atan2(z,x)*28+y*.9);pos.setXYZ(i,x*ripple,y,z*ripple);}
 vase.computeVertexNormals();porcelain.side=THREE.DoubleSide;mesh(vase,porcelain,vessel);vessel.position.set(-3.05,-1.1,-.15);vessel.rotation.y=.5;
 const base=mesh(new THREE.BoxGeometry(2.25,.13,1.8),stone,architecture);base.position.y=-1;
 for(let i=0;i<5;i++){const height=.75+Math.sin(i*.7)*1.05;const block=mesh(new THREE.BoxGeometry(.3,height,1.3-i*.12),stone,architecture);block.position.set((i-2)*.4,height/2-.93,0);}
 architecture.position.set(3,-.05,-.15);architecture.rotation.y=-.42;
 copper.dispose();porcelain.dispose();stone.dispose();
 return [vessel,impeller,architecture];
}
export default function FormationScene({paused,onPhase,fallback}:{paused:boolean;onPhase:(phase:number)=>void;fallback:string}) {
 const host=useRef<HTMLDivElement>(null),running=useRef(!paused),notify=useRef(onPhase),sync=useRef<()=>void>();
 const [failed,setFailed]=useState(false);
 useEffect(()=>{running.current=!paused;sync.current?.();},[paused]);
 useEffect(()=>{notify.current=onPhase;},[onPhase]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.localClippingEnabled=true;
  el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);
  const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),texture=pmrem.fromScene(environment,.06);scene.environment=texture.texture;environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xc7e4ff,0x32261c,2));
  const key=new THREE.DirectionalLight(0xffe4c5,4);key.position.set(-3,5,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xbddcff,3);rim.position.set(4,2,-3);scene.add(rim);
  const assembly=new THREE.Group();scene.add(assembly);const groups=objects();groups.forEach(group=>assembly.add(group));
  const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),-2);
  const solids:THREE.MeshStandardMaterial[]=[],wires:THREE.LineBasicMaterial[]=[],wireGeometries:THREE.BufferGeometry[]=[];
  groups.forEach(group=>{
   const meshes:THREE.Mesh[]=[];group.traverse(obj=>{if(obj instanceof THREE.Mesh)meshes.push(obj);});
   meshes.forEach(obj=>{const material=obj.material as THREE.MeshStandardMaterial;material.clippingPlanes=[plane];solids.push(material);const geometry=new THREE.EdgesGeometry(obj.geometry,24);wireGeometries.push(geometry);const lineMaterial=new THREE.LineBasicMaterial({color:0xc6d7dc,transparent:true,opacity:.3});wires.push(lineMaterial);const line=new THREE.LineSegments(geometry,lineMaterial);obj.add(line);});
  });
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let visible=true,disposed=false,contextFailed=false,frame=0,last=0,elapsed=running.current?.8:13,phase=-1;
  const render=()=>{if(!disposed&&!contextFailed&&visible&&!document.hidden)renderer.render(scene,camera);};
  const update=()=>{
   const t=reduced.matches?13:elapsed%22;
   const next=t<4?0:t<10?1:2;
   if(next!==phase){phase=next;notify.current(next);}
   const reveal=reduced.matches?1:THREE.MathUtils.smoothstep(t,3,10);
   plane.constant=-2+reveal*5;
   wires.forEach(m=>{m.opacity=t<3?.12+t*.09:Math.max(.015,.38*(1-reveal));});
   assembly.rotation.y=reduced.matches?-.06:Math.sin(elapsed*.12)*.12;
   groups[1].rotation.z=-.2+(reduced.matches?0:elapsed*.045);
   // Fade the full composition briefly at the loop seam, never interrupt the CTA.
   const opacity=t>20?1-(t-20)/2:Math.min(1,t/.8);
   renderer.domElement.style.opacity=String(reduced.matches?1:opacity);
  };
  const fit=()=>{const {width,height}=el.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;const mobile=width<650;groups[0].position.x=mobile?-2.5:-3.05;groups[2].position.x=mobile?2.5:3;groups[0].scale.setScalar(mobile?.75:1);groups[2].scale.setScalar(mobile?.75:1);const viewWidth=mobile?8.2:10.4;const distance=Math.max(6.8,viewWidth/(2*Math.tan(THREE.MathUtils.degToRad(17))*camera.aspect));camera.position.set(0,1.4,distance);camera.lookAt(0,.1,0);camera.updateProjectionMatrix();update();render();};
  const tick=(time:number)=>{frame=0;if(disposed||contextFailed||!visible||document.hidden||reduced.matches||!running.current)return;if(time-last>=1000/30){elapsed+=Math.min((time-last)/1000,.05);last=time;update();render();}frame=requestAnimationFrame(tick);};
  const resume=()=>{cancelAnimationFrame(frame);frame=0;if(disposed||contextFailed)return;update();render();if(visible&&!document.hidden&&!reduced.matches&&running.current){last=performance.now();frame=requestAnimationFrame(tick);}};
  sync.current=resume;
  const resize=new ResizeObserver(fit);resize.observe(el);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();});observer.observe(el);
  const lost=(event:Event)=>{event.preventDefault();contextFailed=true;cancelAnimationFrame(frame);renderer.domElement.style.display='none';setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);fit();resume();
  return()=>{disposed=true;cancelAnimationFrame(frame);sync.current=undefined;resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<THREE.BufferGeometry>();assembly.traverse(obj=>{if(obj instanceof THREE.Mesh)geometries.add(obj.geometry);});geometries.forEach(g=>g.dispose());wireGeometries.forEach(g=>g.dispose());solids.forEach(m=>m.dispose());wires.forEach(m=>m.dispose());texture.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[]);
 return <div className="formation-canvas" ref={host} role="img" aria-label="Mekanik çark, tasarım vazosu ve mimari kütle: çizgiden yüzeye dönüşen temsili 3D üretim örnekleri">{failed&&<img src={fallback} alt="3D üretim — temsili uygulama" width="1536" height="1024"/>}</div>;
}
