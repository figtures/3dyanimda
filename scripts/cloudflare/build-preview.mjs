import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {rm} from 'node:fs/promises';
import {brands, loadBrandConfig} from './config.mjs';

/** Select the connected Worker, never infer a brand from a shared repo name. */
export function previewBuildSettings(environment = process.env) {
  if (environment.WORKERS_CI_BRANCH === 'main') {
    throw new Error('The root Wrangler config is for branch previews. Production must use npm run deploy:<brand>.');
  }
  const brand = environment.WRANGLER_CI_OVERRIDE_NAME || environment.WORKER_NAME;
  if (!brands.includes(brand)) {
    throw new Error('Preview requires a recognized WRANGLER_CI_OVERRIDE_NAME or WORKER_NAME: ' + brands.join(', '));
  }
  if (environment.WORKER_NAME && environment.WORKER_NAME !== brand) {
    throw new Error('Preview Worker identity does not match WORKER_NAME.');
  }
  // An ignored brand .env from another checkout must not affect a CI preview.
  const config = loadBrandConfig(brand, environment, undefined, () => false);
  const publicEnv = {
    ...config.publicEnv,
    VITE_TENANT_SLUG: brand,
    VITE_TENANT_HOST: config.domain,
    VITE_GA4_MEASUREMENT_ID: '',
  };
  return {
    brand,
    options: {
      envDir: false,
      define: Object.fromEntries(Object.entries(publicEnv).map(([key, value]) => ['import.meta.env.' + key, JSON.stringify(value)])),
      build: {outDir: '.cloudflare/preview/assets', emptyOutDir: true},
    },
  };
}

export async function cleanPreviewAssets(directory) {
  // The Worker supplies client-route fallback. A Pages-style /* /index.html
  // rule conflicts with Workers' clean-HTML handling and is rejected on upload.
  await rm(path.join(directory, '_redirects'), {force: true});
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const {brand, options} = previewBuildSettings();
  for (const key of Object.keys(process.env)) if (key.startsWith('VITE_')) delete process.env[key];
  const {build} = await import('vite');
  await build(options);
  await cleanPreviewAssets(options.build.outDir);
  console.log(`Built ${brand} branch preview. No production deployment or indexing submission performed.`);
}
