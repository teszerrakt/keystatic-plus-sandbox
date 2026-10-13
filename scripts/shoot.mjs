// Screenshots the editor, signed in, for a fork PR's Proof section.
// Usage: GH_TOKEN=$(gh auth token) pnpm shoot <out-prefix> <path>[,<path>...]
//   BASE      site to open (default http://127.0.0.1:4321, the local dev server)
//   WAIT_FOR  text to wait for before each shot, e.g. "Preview ready"
//   FOLLOW    text of a link to open in a new tab and shoot too, e.g. "Preview this page"
// GitHub's sign-in page cannot be scripted, so the token goes in Keystatic's access
// cookie. It stays in this headless browser.
import { chromium } from 'playwright-core';

const [prefix, paths] = process.argv.slice(2);
if (!prefix || !paths || !process.env.GH_TOKEN) {
  throw new Error('Usage: GH_TOKEN=$(gh auth token) pnpm shoot <out-prefix> <path>[,<path>...]');
}
const base = new URL(process.env.BASE ?? 'http://127.0.0.1:4321');
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
await context.addCookies([
  { name: 'keystatic-gh-access-token', value: process.env.GH_TOKEN, domain: base.hostname, path: '/' },
]);
const page = await context.newPage();
const report = {};
for (const [i, path] of paths.split(',').entries()) {
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  if (process.env.WAIT_FOR) {
    await page.getByText(process.env.WAIT_FOR).first().waitFor({ timeout: 120_000 });
  }
  // Lets spinners and fades settle.
  await page.waitForTimeout(1500);
  const file = `${prefix}-${i + 1}.png`;
  await page.screenshot({ path: file });
  report[file] = path;
}
if (process.env.FOLLOW) {
  const href = await page.locator('a', { hasText: process.env.FOLLOW }).first().getAttribute('href');
  const tab = await context.newPage();
  const res = await tab.goto(href, { waitUntil: 'networkidle' });
  await tab.screenshot({ path: `${prefix}-follow.png` });
  Object.assign(report, { followed: href, status: res?.status() });
}
console.log(JSON.stringify(report, null, 2));
await browser.close();
