import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/quality/live-schema-inventory.ts',outDir:'.cloudflare/schema-audit',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'audit.mjs'}}}});
await import(pathToFileURL(path.resolve('.cloudflare/schema-audit/audit.mjs')).href);
