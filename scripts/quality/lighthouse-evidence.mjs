/** CI-only evidence storage. These helpers never start a browser or submit data. */
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import path from 'node:path';

async function save(file, bytes) {
  await mkdir(path.dirname(file), {recursive:true});
  await writeFile(file, bytes);
  return {file, bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex')};
}

export async function saveHomeTrace(artifacts, directory) {
  // Lighthouse 13 uses Trace/DevtoolsLog, not the obsolete traces.defaultPass shape.
  const trace = artifacts?.Trace;
  const log = artifacts?.DevtoolsLog;
  if (!Array.isArray(trace?.traceEvents) || !trace.traceEvents.length || !Array.isArray(log) || !log.length) {
    throw new Error('Homepage diagnostic evidence is missing Trace or DevtoolsLog');
  }
  const files = await Promise.all([
    save(path.join(directory, 'trace.json.gz'), gzipSync(JSON.stringify(trace))),
    save(path.join(directory, 'devtoolslog.json.gz'), gzipSync(JSON.stringify(log))),
  ]);
  const profileEvents = trace.traceEvents.filter(event => ['Profile', 'ProfileChunk', 'CpuProfile'].includes(event.name)).length;
  return {files, traceEvents:trace.traceEvents.length, devtoolsEvents:log.length, cpuProfileEvents:profileEvents,
    cpuProfileAvailable:profileEvents > 0};
}

export async function saveLabSourceMaps(root, destination) {
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, {withFileTypes:true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && entry.name.endsWith('.js.map')) {
        const bundle = file.slice(0, -4);
        const bytes = await readFile(file);
        const map = JSON.parse(bytes);
        if (map.version !== 3 || !Array.isArray(map.sources) || typeof map.mappings !== 'string') throw new Error('Invalid lab source map: '+file);
        const bundleBytes = await readFile(bundle);
        files.push({...await save(path.join(destination, path.relative(root, file)+'.gz'), gzipSync(bytes)),
          bundle:path.relative(root, bundle), bundleSha256:createHash('sha256').update(bundleBytes).digest('hex')});
      }
    }
  }
  await walk(root);
  if (!files.length) throw new Error('No lab JavaScript source maps were generated');
  return files.sort((a,b) => a.bundle.localeCompare(b.bundle));
}
