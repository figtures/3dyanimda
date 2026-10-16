import {zipSync,strToU8} from 'fflate';
// Original 10 mm cube fixtures; no customer model or external geometry.
export const vertices=[[0,0,0],[10,0,0],[10,10,0],[0,10,0],[0,0,10],[10,0,10],[10,10,10],[0,10,10]];
export const faces=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[0,4,7],[0,7,3],[1,2,6],[1,6,5]];
export const obj=vertices.map(v=>'v '+v.join(' ')).join('\n')+'\n'+faces.map(f=>'f '+f.map(i=>i+1).join(' ')).join('\n');
export const stl='solid cube\n'+faces.map(f=>'facet normal 0 0 0\nouter loop\n'+f.map(i=>'vertex '+vertices[i].join(' ')).join('\n')+'\nendloop\nendfacet').join('\n')+'\nendsolid cube';
export function threeMf({unit='millimeter',scale=1,assembly=false,cycle=false,external=false}={}) {
 const mesh='<mesh><vertices>'+vertices.map(v=>`<vertex x="${v[0]*scale}" y="${v[1]*scale}" z="${v[2]*scale}"/>`).join('')+'</vertices><triangles>'+faces.map(f=>`<triangle v1="${f[0]}" v2="${f[1]}" v3="${f[2]}"/>`).join('')+'</triangles></mesh>';
 const start=`<model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06" unit="${unit}">`;
 const materials='<basematerials id="10"><base name="Red" displaycolor="#ff0000"/></basematerials>';
 const geometry=`<object id="1" pid="10" pindex="0">${mesh}</object>`;
 const path=external?'https://example.com/model.model':'/3D/Objects/part.model';
 const components=`<object id="2"><components><component objectid="${cycle?'2':'1'}"${cycle?'':` p:path="${path}"`}/><component objectid="1" p:path="${path}" transform="1 0 0 0 1 0 0 0 1 ${30*scale} 0 0"/></components></object>`;
 const files={'[Content_Types].xml':strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'),'_rels/.rels':strToU8('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" Target="/3D/3dmodel.model"/></Relationships>'),'3D/3dmodel.model':strToU8(start+'<resources>'+materials+(assembly?components:geometry)+`</resources><build><item objectid="${assembly?'2':'1'}"/></build></model>`)};
 if(assembly)files['3D/Objects/part.model']=strToU8(start+'<resources>'+materials+geometry+'</resources><build/></model>');
 return zipSync(files);
}
