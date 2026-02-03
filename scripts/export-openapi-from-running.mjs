import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;
    const key = raw.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, { timeoutMs = 8000, headers } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const args = parseArgs(process.argv.slice(2));
const service = args.service ?? 'social-api';
const outDir = args.outDir ?? 'packages/api-contracts/openapi';
const port = args.port ? Number.parseInt(args.port, 10) : 8080;
const baseUrl = args.baseUrl ?? `http://localhost:${port}`;
const timeoutSec = args.timeoutSec ? Number.parseInt(args.timeoutSec, 10) : 30;

const healthUrl = `${baseUrl}/health`;
const openApiJsonUrls = [
  `${baseUrl}/v3/api-docs`,
  `${baseUrl}/api-docs`,
];
const openApiYamlUrls = [
  `${baseUrl}/v3/api-docs.yaml`,
  `${baseUrl}/api-docs.yaml`,
];

const outDirAbs = path.resolve(repoRoot, outDir);
await fs.mkdir(outDirAbs, { recursive: true });

const outJsonPathAbs = path.join(outDirAbs, `${service}.json`);
const outYamlPathAbs = path.join(outDirAbs, `${service}.yaml`);

console.log(`Exporting OpenAPI from running service: ${baseUrl}`);

const deadline = Date.now() + timeoutSec * 1000;
while (Date.now() < deadline) {
  try {
    const resp = await fetchWithTimeout(healthUrl, { timeoutMs: 5000 });
    if (resp.ok) break;
  } catch {
    // ignore
  }
  await sleep(500);
}

{
  let ok = false;
  try {
    const resp = await fetchWithTimeout(healthUrl, { timeoutMs: 5000 });
    ok = resp.ok;
  } catch {
    ok = false;
  }

  if (!ok) {
    throw new Error(`Service is not reachable. Start the API first, then retry. Expected: ${healthUrl}`);
  }
}

{
  let exportedFrom = null;
  for (const url of openApiJsonUrls) {
    const resp = await fetchWithTimeout(url, {
      timeoutMs: 30000,
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) continue;

    const buf = Buffer.from(await resp.arrayBuffer());
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 2048));
    if (!text.includes('"openapi"')) continue;

    await fs.writeFile(outJsonPathAbs, buf);
    exportedFrom = url;
    break;
  }

  if (!exportedFrom) {
    throw new Error(`Failed to download OpenAPI JSON. Tried: ${openApiJsonUrls.join(', ')}`);
  }
}

let yamlGenerated = false;
try {
  for (const url of openApiYamlUrls) {
    const resp = await fetchWithTimeout(url, {
      timeoutMs: 30000,
      headers: { Accept: 'application/yaml, application/x-yaml, text/yaml, text/plain' },
    });
    if (!resp.ok) continue;
    const buf = Buffer.from(await resp.arrayBuffer());
    await fs.writeFile(outYamlPathAbs, buf);
    yamlGenerated = true;
    break;
  }
} catch {
  // ignore
}

console.log('Export completed:');
console.log(` - ${path.relative(repoRoot, outJsonPathAbs)}`);
if (yamlGenerated) {
  console.log(` - ${path.relative(repoRoot, outYamlPathAbs)}`);
} else {
  console.log(` - YAML not generated (endpoint not available): ${openApiYamlUrls[0]}`);
}
