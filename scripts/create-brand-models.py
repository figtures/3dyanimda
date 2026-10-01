"""Deterministic vector illustrations; these are concepts, not customer project photos."""
import math, pathlib
from math import sin, cos, pi
out=pathlib.Path('public/brand')
def render(name, meshes):
 faces=[]
 def project(p):
  x,y,z=p
  return (300+(x-y)*90,320+(x+y)*42-z*110, x+y+z*.6)
 for verts,polys,col in meshes:
  for inds in polys:
   pts=[verts[i] for i in inds]; a,b,c=pts[:3]
   u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
   n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
   norm=math.sqrt(sum(x*x for x in n)) or 1
   light=.50+.50*abs(sum(n[i]*[-.25,-.5,.83][i] for i in range(3))/norm)
   color='#'+''.join(f'{max(0,min(255,int(c*light))):02x}' for c in col)
   pp=[project(p) for p in pts]
   faces.append((sum(p[2] for p in pp)/len(pp),'<polygon points="'+' '.join(f'{p[0]:.1f},{p[1]:.1f}' for p in pp)+f'" fill="{color}" stroke="{color}" stroke-width=".5"/>'))
 faces.sort(key=lambda x:x[0])
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><filter id="blur"><feGaussianBlur stdDeviation="16"/></filter></defs><ellipse cx="300" cy="464" rx="150" ry="27" fill="#182c18" opacity=".17" filter="url(#blur)"/>'+''.join(f[1] for f in faces)+'</svg>'
 (out/(name+'.svg')).write_text(svg)
def torus(r=.62,R=1.35,z=.8,wavy=False,gear=False):
 verts=[];N=100;M=28
 for i in range(N):
  u=i*2*pi/N
  for j in range(M):
   v=j*2*pi/M
   radius=R+r*cos(v)+(0.12*cos(10*u) if gear else 0)
   verts.append((radius*cos(u),radius*sin(u),z+r*sin(v)+(.2*sin(3*u) if wavy else 0)))
 faces=[]
 for i in range(N):
  for j in range(M): faces.append([i*M+j,((i+1)%N)*M+j,((i+1)%N)*M+(j+1)%M,i*M+(j+1)%M])
 return (verts,faces,(108,120,100))
def box(x,y,z,w,d,h,col):
 v=[(x,y,z),(x+w,y,z),(x+w,y+d,z),(x,y+d,z),(x,y,z+h),(x+w,y,z+h),(x+w,y+d,z+h),(x,y+d,z+h)]
 return(v,[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]],col)
render('form',[torus(wavy=True)])
render('parts',[torus(r=.42,R=1.2,z=1,gear=True),torus(r=.15,R=.65,z=1.8)])
render('industry',[box(-1.5,-1.2,0,3,2.4,.35,(142,147,141)),box(-1.5,-1.2,.35,.35,2.4,1.4,(114,120,110)),box(1.15,-1.2,.35,.35,2.4,1.4,(114,120,110)),torus(r=.25,R=.6,z=1.35)])
models=[box(-1.7,-1.7,-.15,3.4,3.4,.2,(174,175,164))]
for x,y,w,d,h in [(-1.2,-1.1,.9,1.7,1.35),(.1,-1.1,1.05,.85,2.1),(.1,.1,1.05,.75,.85)]:
 models.append(box(x,y,0,w,d,h,(229,229,211)))
 for k in range(1,int(h/.24)):
  models.append(box(x-.015,y-.015,k*.24,w+.03,d+.03,.018,(137,149,143)))
render('architecture',models)
