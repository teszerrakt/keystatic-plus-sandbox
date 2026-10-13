// Uploads proof images or videos for a fork PR to Cloudflare R2 and prints
// Markdown for the PR's Proof section.
// Usage: pnpm proof <pr-number> <file>...
// Reads ~/.config/plus-proofs.env (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
// PROOFS_BUCKET, PROOFS_URL) for this run only, so wrangler's own login stays
// on whatever account it already uses.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, extname, join } from 'node:path';

const [pr, ...files] = process.argv.slice(2);
if (!/^\d+$/.test(pr ?? '') || files.length === 0) {
  throw new Error('Usage: pnpm proof <pr-number> <file>...');
}
const envFile = join(homedir(), '.config/plus-proofs.env');
const env = Object.fromEntries(
  readFileSync(envFile, 'utf8')
    .split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4' };

for (const file of files) {
  const type = types[extname(file).toLowerCase()];
  if (!type) throw new Error(`Not an image or video: ${file}`);
  const key = `pr-${pr}/${basename(file)}`;
  execFileSync(
    'npx',
    ['wrangler@4.144.0', 'r2', 'object', 'put', `${env.PROOFS_BUCKET}/${key}`, '--file', file, '--content-type', type, '--remote'],
    { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, ...env } },
  );
  const url = `${env.PROOFS_URL.replace(/\/$/, '')}/${key}`;
  // GitHub plays only its own attachments inline; a video is a link.
  console.log(type.startsWith('video/') ? `[${basename(file)}](${url})` : `![${basename(file, extname(file))}](${url})`);
}
