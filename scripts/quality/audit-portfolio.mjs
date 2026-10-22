/** Bounded, local portfolio evidence. Does not approve publication or access the CMS. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {JSDOM} from 'jsdom';

const root=process.cwd();
const authoring='content/authoring/portfolio';
const projectFile=`${authoring}/projects.json`;
const assetFile=`${authoring}/assets.json`;
const briefFile=`${authoring}/visual-briefs.json`;
const output='docs/audits/portfolio-content-review-2026-10-22.json';
const combinedOutput='artifacts/release/portfolio-combined-input.json';
const brands=['3dyanimda','3dsanayi','maketyanimda','parcayanimda'];
const hash=value=>createHash('sha256').update(value).digest('hex');
const readJSON=async file=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const key=row=>`${row.brand}/${row.slug}`;
const normalized=value=>String(value).normalize('NFKC').replace(/\s+/g,' ').trim();
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'
 ?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const requireUnique=(rows,selector,label)=>assert.equal(new Set(rows.map(selector)).size,rows.length,label);

const projects=await readJSON(projectFile),assets=await readJSON(assetFile),briefs=await readJSON(briefFile);
for(const [label,rows] of [['projects',projects],['assets',assets],['visual briefs',briefs]]){
 assert.ok(Array.isArray(rows),`${label}: array required`);
 assert.equal(rows.length,28,`${label}: exactly 28 records`);
 requireUnique(rows,key,`${label}: duplicate brand/slug`);
 for(const brand of brands)assert.equal(rows.filter(row=>row.brand===brand).length,7,`${label}: seven records for ${brand}`);
}
requireUnique(projects,row=>row.slug,'Application slugs must be distinct across the four brand selections');
requireUnique(projects,row=>normalized(row.title_tr),'Duplicate project title');
requireUnique(projects,row=>normalized(row.excerpt_tr),'Duplicate project excerpt');
requireUnique(projects,row=>normalized(row.content_tr),'Duplicate complete project body');
requireUnique(assets,row=>row.path,'Duplicate asset path');
requireUnique(assets,row=>row.sha256,'Duplicate image bytes in manifest');

const generationFiles=(await readdir(path.join(root,authoring)))
 .filter(name=>/^(image-generation|generation-\d+)\.json$/.test(name)).sort()
 .map(name=>`${authoring}/${name}`);
assert.ok(generationFiles.length,'Image generation provenance is required');
const generated=new Map();
for(const file of generationFiles){
 const rows=await readJSON(file);assert.ok(Array.isArray(rows),`${file}: array required`);
 for(const row of rows){assert.ok(!generated.has(key(row)),`${file}: duplicate generation record ${key(row)}`);generated.set(key(row),{...row,file});}
}
assert.equal(generated.size,28,'Exactly 28 generation records');
const assetsByKey=new Map(assets.map(row=>[key(row),row]));
const briefsByKey=new Map(briefs.map(row=>[key(row),row]));
const records=[];
const portfolioAuditRows=[];
for(const project of projects){
 const id=key(project),asset=assetsByKey.get(id),brief=briefsByKey.get(id),generation=generated.get(id);
 assert.ok(brands.includes(project.brand),`${id}: registered brand required`);
 assert.match(project.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/,`${id}: safe slug required`);
 for(const field of ['title_tr','excerpt_tr','content_tr','industry'])assert.ok(typeof project[field]==='string'&&project[field].trim(),`${id}: missing ${field}`);
 assert.ok(Array.isArray(project.tags)&&project.tags.includes('application')&&project.tags.includes('illustrative-image'),`${id}: application and illustrative-image classification required`);
 assert.ok(!project.tags.includes('concept'),`${id}: obsolete concept classification must be removed`);
 assert.ok(normalized(project.content_tr).length>500,`${id}: substantive application body required`);
 assert.ok(asset&&brief&&generation,`${id}: asset/brief/generation record required`);
 const expectedPath=`/images/portfolio/${project.brand}/${project.slug}.webp`;
 assert.equal(project.cover_image_url,expectedPath,`${id}: cover must belong to its application`);
 assert.equal(asset.path,expectedPath,`${id}: manifest path must match cover`);
 assert.match(asset.sha256,/^[a-f0-9]{64}$/,`${id}: asset SHA-256 required`);
 assert.ok(typeof asset.source==='string'&&asset.source.length,`${id}: recorded generation source required`);
 assert.equal(asset.source,generation.source,`${id}: source provenance mismatch`);
 assert.match(asset.tool,/image_gen/,`${id}: generated asset provenance required`);
 assert.match(generation.tool,/image_gen/,`${id}: generation tool required`);
 assert.ok(typeof generation.prompt==='string'&&generation.prompt.length>100,`${id}: generation prompt required`);
 assert.equal(generation.subject,brief.subject,`${id}: visual brief/generation subject mismatch`);
 const bytes=await readFile(path.join(root,'public',expectedPath.slice(1)));
 assert.equal(hash(bytes),asset.sha256,`${id}: cover bytes changed after manifest`);
 assert.equal(bytes.length,asset.bytes,`${id}: cover byte count mismatch`);
 const metadata=await sharp(bytes).metadata();
 assert.equal(metadata.format,'webp',`${id}: WebP cover required`);
 assert.equal(metadata.width,asset.width,`${id}: cover width mismatch`);
 assert.equal(metadata.height,asset.height,`${id}: cover height mismatch`);
 assert.equal(metadata.width,1200,`${id}: 1200px cover required`);
 assert.equal(metadata.height,900,`${id}: 900px cover required`);
 const dom=new JSDOM(project.content_tr);
 try{
  const document=dom.window.document;
  assert.equal(document.querySelectorAll('[data-concept-disclosure]').length,0,`${id}: obsolete concept-notice markup must be removed`);
  assert.doesNotMatch(normalized(document.body.textContent),/tamamlanmış müşteri projesi değildir|temsili bir tasarım konseptidir/i,`${id}: obsolete boilerplate disclaimer must be removed`);
  assert.ok(document.querySelectorAll('h2,h3').length>=3,`${id}: structured application explanation required`);
  assert.ok(document.querySelectorAll('p,li').length>=4,`${id}: needs, process, practical checks and project inputs require substantive prose`);
  // Keep every visible heading and paragraph: no disclosure or other prose is
  // excluded from the global originality input.
  const sections=[...document.querySelectorAll('h2,h3,p,li')].map(node=>({body:normalized(node.textContent)})).filter(section=>section.body);
  portfolioAuditRows.push({brand:project.brand,path:`/portfoy/${project.slug}`,kind:'portfolio',status:'published',
   title:project.title_tr,summary:project.excerpt_tr,sections,faq:[],image:expectedPath});
 }finally{dom.window.close();}
 records.push({brand:project.brand,slug:project.slug,title:project.title_tr,industry:project.industry,
  classification:'application',illustrativeImage:true,payloadSha256:hash(JSON.stringify(stable(project))),bodySha256:hash(normalized(project.content_tr)),
  cover:{path:expectedPath,sha256:asset.sha256,bytes:bytes.length,width:metadata.width,height:metadata.height},
  provenance:{generationFile:generation.file,tool:generation.tool,promptSha256:hash(generation.prompt),subjectSha256:hash(generation.subject)}});
}
requireUnique(records,row=>row.payloadSha256,'Duplicate complete project payload');
requireUnique(records,row=>row.cover.sha256,'Duplicate actual cover bytes');
const editorialFiles=['src/content/pages.json','src/content/editorial-pages.json','src/content/search-pages.json'];
const combined=new Map();
for(const file of editorialFiles)for(const record of await readJSON(file))combined.set(record.brand+record.path,record);
assert.equal(combined.size,796,'Existing landing inventory must remain 796 records');
for(const record of portfolioAuditRows){assert.ok(!combined.has(record.brand+record.path),'Portfolio path overlaps existing content');combined.set(record.brand+record.path,record);}
assert.equal(combined.size,824,'Combined audit input: 796 landing and 28 portfolio records');
const combinedJSON=JSON.stringify([...combined.values()],null,2)+'\n';
await mkdir(path.dirname(path.join(root,combinedOutput)),{recursive:true});
await writeFile(path.join(root,combinedOutput),combinedJSON);
const evidence=await Promise.all([projectFile,assetFile,briefFile,...generationFiles,...editorialFiles].map(async file=>({file,sha256:hash(await readFile(path.join(root,file)))})));
const report={result:'pass',reviewType:'Automated bounded portfolio payload and asset verification',testedAt:new Date().toISOString(),
 projects:records.length,brands:Object.fromEntries(brands.map(brand=>[brand,records.filter(row=>row.brand===brand).length])),
 checks:['28 distinct brand/slug payloads, seven per brand','distinct titles, excerpts and complete bodies','application and illustrative-image classification',
  'nonempty category and substantial structured application text; no obsolete concept disclaimer','one matching cover, visual brief and generation record per application',
  'cover SHA-256, byte size, WebP format and 1200×900 dimensions match manifest','28 distinct actual image hashes',
  'generation tool, source reference, prompt and subject reconciled with visual briefs'],
 combinedAudit:{input:combinedOutput,inputRecords:824,expectedRecordsWithHomeAllocations:828,sha256:hash(combinedJSON),
  exclusion:null,allPortfolioProseRetained:true,
  retainedProse:'Every application excerpt, heading, paragraph and list item is included. No concept notices or other prose are excluded. Existing landing inventory and four home asset allocations are also retained.',
  excludedNoticeCount:0,excludedNotices:[]},
 evidence,records,limitations:['This automated report is not a publication certificate or a human semantic review.',
  'Exact text and byte uniqueness do not establish visual or semantic dissimilarity, web-wide uniqueness or legal exclusivity.',
  'Recorded generation references are reconciled; ephemeral original files are not required or independently revalidated by this check.',
  'No browser execution, live CMS write/readback, deployment, production route or delivered customer-work claim is made.']};
await mkdir(path.dirname(path.join(root,output)),{recursive:true});
await writeFile(path.join(root,output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({result:report.result,projects:report.projects,brands:report.brands,output,combinedInput:combinedOutput,expectedGlobalAuditRecords:828,excludedNoticeCount:0}));
