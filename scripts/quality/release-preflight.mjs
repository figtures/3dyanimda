/** Fail closed before business-domain HTML export. Never issues an approval. */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {sourceSnapshot,verifyCertificate} from './release-certificate.mjs';
const snapshot=sourceSnapshot();
let review;
try{review=JSON.parse(readFileSync('content/release-review.json','utf8'));}catch{throw Error('Release blocked: final review has not been recorded.');}
verifyCertificate(review,snapshot);
const audit=spawnSync(process.env.RELEASE_PYTHON||'python',['scripts/quality/audit-content.py','--all','--output','artifacts/release/global-originality.json'],{stdio:'inherit'});
if(audit.status!==0)throw Error('Release blocked: network originality audit did not pass.');
console.log('Release preflight passed for source snapshot '+snapshot.sourceHash);
