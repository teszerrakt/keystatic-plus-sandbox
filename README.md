# Plus Sandbox

A test site for [the Keystatic plus fork](https://github.com/teszerrakt/keystatic/tree/plus). Every page is sample text: edit, publish and delete freely. Its job is to prove fork PRs against a real GitHub repo and real Vercel previews.

Stack: Astro, Starlight, React and the fork's `@keystatic/core`, deployed on Vercel. Three languages: English, Bahasa Indonesia and Simplified Chinese. Drafts are on (`drafts: true`), with the image library and menu sections.

## Prove a fork PR

The fork's "Publish (Preview)" workflow publishes every PR commit to [pkg.pr.new](https://pkg.pr.new). Nothing goes to npm.

1. Find the commit's build in that workflow's log, or use the PR's head commit sha.
2. On a branch here: `pnpm use-fork <sha>`, then commit `package.json` and the lockfile, and push. Vercel builds a preview.
3. Run the flow in the editor and capture it for the PR's Proof section (below).

## Capture proof

Run the editor locally (`pnpm dev --host 127.0.0.1`, GitHub mode from `.env`), then:

```sh
GH_TOKEN=$(gh auth token) WAIT_FOR="Preview ready" FOLLOW="Preview this page" \
  pnpm shoot /tmp/pr-5 "/keystatic/branch/draft%2Fsome-draft/collection/docsEn/item/getting-started"
```

It signs in with your `gh` token as Keystatic's access cookie, waits for the text, and saves `/tmp/pr-5-1.png` (plus `-follow.png` for the followed link). Upload them with `pnpm proof <pr-number> <file>...`: it puts them in the Cloudflare R2 bucket from `~/.config/plus-proofs.env` (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PROOFS_BUCKET`, `PROOFS_URL`) under `pr-<N>/` and prints the Markdown to paste. The token is used for that run only, so `wrangler`'s own login is untouched. `PUBLIC_KEYSTATIC_DRAFTS=false pnpm dev …` shows the editor without drafts.

The browser comes from Playwright's cache; if it is missing: `pnpm exec playwright-core install chromium-headless-shell`. Chinese text shows as boxes unless a CJK font is installed.

## Environment

See `.env.example`. Unset `PUBLIC_KEYSTATIC_GITHUB_REPO` locally to edit local files with no drafts. Set every variable in Vercel for both Production and Preview, because draft branches build as previews.

`main` requires the `check` workflow, because Publish now waits for a required check.
