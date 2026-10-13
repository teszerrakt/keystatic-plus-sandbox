# Plus Sandbox

A test site for [the Keystatic plus fork](https://github.com/teszerrakt/keystatic/tree/plus). Every page is sample text: edit, publish and delete freely. Its job is to prove fork PRs against a real GitHub repo and real Vercel previews.

Stack: Astro, Starlight, React and the fork's `@keystatic/core`, deployed on Vercel. Three languages: English, Bahasa Indonesia and Simplified Chinese. Drafts are on (`drafts: true`), with the image library and menu sections.

## Prove a fork PR

The fork comes from tarballs in `vendor/`, so unreleased code builds here and on Vercel.

1. In the fork, on the PR branch: `pnpm build:packages && node scripts/plus-pack.mjs 0.6.9-plus.<major>.<minor>.<patch>-pr<N>`
2. Here: `pnpm use-fork 0.6.9-plus.<major>.<minor>.<patch>-pr<N>` (reads `../keystatic/plus-dist`; set `PLUS_DIST` to change it)
3. Commit `vendor/`, `package.json`, `pnpm-workspace.yaml` and the lockfile on a branch, and push. Vercel builds a preview.
4. Run the flow in the editor and capture it for the PR's Proof section.

## Environment

See `.env.example`. Unset `PUBLIC_KEYSTATIC_GITHUB_REPO` locally to edit local files with no drafts. Set every variable in Vercel for both Production and Preview, because draft branches build as previews.

`main` requires the `check` workflow, because Publish now waits for a required check.
