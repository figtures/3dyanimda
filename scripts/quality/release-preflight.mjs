/** Fail closed before business-domain HTML export. This does not approve drafts. */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const audit = spawnSync('python', ['scripts/quality/audit-content.py'], { stdio: 'inherit' });
if (audit.status !== 0) throw new Error('Release blocked: network originality audit did not pass.');
// Bind the human review to all shipped source, public assets and authoring records.
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const file=path.posix.join(dir,entry.name);
    if(entry.isDirectory()) walk(file);
    else if(entry.isFile() && file!=='content/release-review.json') files.push(file);
    else throw new Error(`Unsupported release entry: ${file}`);
  }
}
for (const dir of ['src','public','content']) walk(dir);
const hash=createHash('sha256');
for(const file of files.sort()) hash.update(file+'\0').update(readFileSync(file)).update('\0');
const sourceHash=hash.digest('hex');
let review;
try { review=JSON.parse(readFileSync('content/release-review.json','utf8')); }
catch { throw new Error('Release blocked: rendered-page, visual, factual and SEO review has not been recorded.'); }
if(review.policy!=='global-originality-v1' || review.sourceHash!==sourceHash || review.result!=='pass')
 throw new Error('Release blocked: missing or stale final review.');
for(const check of ['allBrandsAllThemesAllRoutes','renderedText','imageProvenance','visualSimilarity','modelGeometry','localEvidence','seoGeoParity'])
 if(review.checks?.[check]!==true) throw new Error(`Release blocked: ${check} review incomplete.`);
if(!review.reviewer || !review.reviewedAt || !Array.isArray(review.evidence) || review.evidence.length===0)
 throw new Error('Release blocked: review evidence is required.');
console.log('Release preflight passed for source snapshot '+sourceHash);
