/** Record the explicitly reviewed bounded delta, preserving historical evidence. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sourceSnapshot,verifyCertificate} from './quality/release-certificate.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const reviewFile='docs/audits/seo-gap-release-review-2026-10-23.json';
assert.equal((await read(reviewFile)).result,'pass');
const originality=await read('docs/audits/seo-gap-originality-2026-10-23.json');
assert.ok(originality.result==='pass'||originality.status==='pass','Current originality evidence must pass');
const certificate=await read('content/release-review.json');
const files=[reviewFile,'content/authoring/seo-gap-cms-delta-2026-10-23.json','docs/audits/seo-gap-cms-baseline-hashes-2026-10-23.json','content/authoring/seo-gap-meta-3dyanimda-2026-10-23.json','docs/audits/seo-gap-originality-2026-10-23.json','docs/audits/seo-gap-content-contracts-2026-10-23.json','docs/audits/3dy-guide-assets-2026-10-23.json','docs/audits/3dy-content-sources-2026-10-23.json','docs/audits/seo-critical-css-comparison-2026-10-22.json','docs/audits/seo-local-quality-2026-10-23.json','docs/audits/seo-gap-live-baseline-2026-10-23.json'];
files.push('scripts/quality/public-export-routes.mjs','scripts/quality/public-export-routes.test.mjs');
files.push('scripts/quality/audit-search-contracts.mjs','scripts/search/social-image-contract.test.mjs','scripts/test-home-flow.mjs','scripts/test-navigation.mjs','scripts/quality/review-candidate.mjs');
for(const file of files){const sha256=createHash('sha256').update(await readFile(file)).digest('hex');const index=certificate.evidence.findIndex(item=>item.file===file);const item={file,sha256};if(index<0)certificate.evidence.push(item);else certificate.evidence[index]=item;}
const snapshot=sourceSnapshot();
certificate.sourceHash=snapshot.sourceHash;certificate.sourceFileCount=snapshot.sourceFileCount;certificate.reviewedAt=new Date().toISOString();
certificate.scope.latestSeoGapReview=reviewFile;certificate.scope.latestSeoGapExistingLandingUpdates=17;certificate.scope.latestSeoGapNewPages=5;
certificate.scope.historicalEvidenceNote='Earlier all-route/theme evidence keeps its original coverage and dates. The latest bounded review describes current tests and remaining CI/live verification separately.';
verifyCertificate(certificate,snapshot);
await writeFile('content/release-review.json',JSON.stringify(certificate,null,2)+'\n');
console.log(JSON.stringify({sourceHash:snapshot.sourceHash,sourceFileCount:snapshot.sourceFileCount,evidence:certificate.evidence.length}));
