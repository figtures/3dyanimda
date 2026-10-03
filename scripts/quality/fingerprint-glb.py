"""Fingerprint uncompressed GLB meshes, ignoring name, material, translation and uniform scale.
PCA canonicalization plus radial quantiles detects transformed copies. Symmetry/near-matches require review.
"""
import struct,json,hashlib
from pathlib import Path
import numpy as np
DTYPES={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1',5122:'<i2',5120:'i1'}
def signature(path):
 raw=Path(path).read_bytes()
 if raw[:4]!=b'glTF':raise ValueError('GLB required')
 size,kind=struct.unpack_from('<II',raw,12);gltf=json.loads(raw[20:20+size]);start=20+size
 size,kind=struct.unpack_from('<II',raw,start);binary=raw[start+8:start+8+size]
 def accessor(i):
  a=gltf['accessors'][i];v=gltf['bufferViews'][a['bufferView']]
  if 'sparse' in a:raise ValueError('Sparse geometry requires manual review')
  width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];dt=np.dtype(DTYPES[a['componentType']]);offset=v.get('byteOffset',0)+a.get('byteOffset',0)
  return np.ndarray((a['count'],width),dtype=dt,buffer=binary,offset=offset,strides=(v.get('byteStride',dt.itemsize*width),dt.itemsize)).copy()
 cloud=[]
 def walk(index,parent):
  node=gltf['nodes'][index]
  if 'matrix' in node:m=np.array(node['matrix']).reshape(4,4).T
  else:
   x,y,z,w=node.get('rotation',[0,0,0,1]);m=np.eye(4);m[:3,:3]=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])@np.diag(node.get('scale',[1,1,1]));m[:3,3]=node.get('translation',[0,0,0])
  world=parent@m
  if 'mesh' in node:
   for p in gltf['meshes'][node['mesh']]['primitives']:
    if p.get('extensions'):raise ValueError('Compressed geometry requires decoder review')
    points=accessor(p['attributes']['POSITION']);cloud.append((np.c_[points,np.ones(len(points))]@world.T)[:,:3])
  for child in node.get('children',[]):walk(child,world)
 for root in gltf['scenes'][gltf.get('scene',0)]['nodes']:walk(root,np.eye(4))
 points=np.unique(np.round(np.concatenate(cloud),6),axis=0);points-=points.mean(axis=0);scale=np.sqrt(np.mean(np.sum(points**2,axis=1)))
 if not scale>0:raise ValueError('Degenerate model')
 points/=scale;values,axes=np.linalg.eigh(points.T@points/len(points));canonical=points@axes
 # Absolute PCA coordinates make mirror/sign changes match as well.
 canonical=np.round(np.abs(canonical),4);canonical=canonical[np.lexsort(canonical.T)]
 radial=np.quantile(np.linalg.norm(points,axis=1),np.linspace(0,1,65)).round(4).tolist()
 return {'geometry_hash':hashlib.sha256(canonical.tobytes()).hexdigest(),'shape_vector':np.concatenate([values,np.array(radial)]).round(4).tolist(),'vertices':len(points)}
if __name__=='__main__':
 import sys
 print(json.dumps(signature(sys.argv[1])))
