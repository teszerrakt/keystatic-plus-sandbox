// Points the sandbox at a fork build from pkg.pr.new, so a PR's code can be proven here.
// Usage: node scripts/use-fork.mjs <commit sha>   e.g. be30037
// The fork's "Publish (Preview)" workflow publishes every PR commit; its log lists the URLs.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const sha = process.argv[2];
if (!/^[0-9a-f]{7,40}$/.test(sha ?? '')) throw new Error('Usage: node scripts/use-fork.mjs <commit sha>');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
// The full path is required: the short form resolves @keystatic/core to upstream's repo.
pkg.dependencies['@keystatic/core'] = `https://pkg.pr.new/teszerrakt/keystatic/@keystatic/core@${sha}`;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
// Core also lists @keystar/ui as a peer, which pnpm would fill from npm.
const ws = readFileSync('pnpm-workspace.yaml', 'utf8').replace(/(@keystar\/ui@)[0-9a-f]+/, `$1${sha}`);
writeFileSync('pnpm-workspace.yaml', ws);

execFileSync('pnpm', ['install'], { stdio: 'inherit' });
console.log(`Using the fork at ${sha}`);
