// Contract guard (research R18): the generated API types must match the project's single API
// contract in ../specs (the same file the backend tests validate against).
// Usage: node scripts/contract-check.mjs           -> check only (fails on drift)
//        node scripts/contract-check.mjs --write   -> regenerate the types
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CONTRACT = '../specs/001-business-info-site/contracts/openapi.yaml';
const GENERATED = 'src/app/core/api/generated/openapi.ts';
const GENERATOR = 'openapi-typescript@7.13.0';

function generate(output) {
  execFileSync('npx', ['--yes', GENERATOR, CONTRACT, '-o', output], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

const normalize = (text) => text.replace(/\r\n/g, '\n');

if (process.argv.includes('--write')) {
  generate(GENERATED);
  process.exit(0);
}

const fresh = join(mkdtempSync(join(tmpdir(), 'contract-')), 'openapi.ts');
generate(fresh);
const upToDate =
  existsSync(GENERATED) &&
  normalize(readFileSync(GENERATED, 'utf8')) === normalize(readFileSync(fresh, 'utf8'));

if (!upToDate) {
  console.error(`contract:check failed: ${GENERATED} is out of date. Run: npm run contract:generate`);
  process.exit(1);
}
console.log('contract:check passed');
