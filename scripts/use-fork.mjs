// Points the sandbox at freshly packed fork tarballs, so a PR's code can be proven here.
// Usage: node scripts/use-fork.mjs <version>   e.g. 0.6.9-plus.1.0.0-pr4
// Pack first in the fork: `pnpm build:packages && node scripts/plus-pack.mjs <version>`.
import { copyFileSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const version = process.argv[2];
if (!version?.includes('-')) throw new Error('Usage: node scripts/use-fork.mjs <prerelease version>');
const suffix = version.slice(version.indexOf('-') + 1);
const dist = resolve(process.env.PLUS_DIST ?? '../keystatic/plus-dist');
const core = `teszerrakt-keystatic-core-${version}.tgz`;
const ui = readdirSync(dist).find((f) => f.startsWith('teszerrakt-keystar-ui-') && f.endsWith(`-${suffix}.tgz`));
if (!ui) throw new Error(`No keystar-ui tarball for ${suffix} in ${dist}`);

for (const f of readdirSync('vendor')) rmSync(join('vendor', f));
copyFileSync(join(dist, core), join('vendor', core));
copyFileSync(join(dist, ui), join('vendor', ui));

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.dependencies['@keystatic/core'] = `file:vendor/${core}`;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
const ws = readFileSync('pnpm-workspace.yaml', 'utf8').replace(/('@keystar\/ui': file:vendor\/)\S+/, `$1${ui}`);
writeFileSync('pnpm-workspace.yaml', ws);

execFileSync('pnpm', ['install'], { stdio: 'inherit' });
console.log(`Using ${core} and ${ui}`);
