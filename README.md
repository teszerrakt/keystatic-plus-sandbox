# Plus Sandbox

A test site for [the Keystatic plus fork](https://github.com/teszerrakt/keystatic/tree/plus). Every page is sample text: edit, publish and delete freely. Its job is to prove fork PRs against a real GitHub repo and real Vercel previews.

Stack: Astro, Starlight, React and the fork's `@keystatic/core`, deployed on Vercel. Three languages: English, Bahasa Indonesia and Simplified Chinese. Drafts are on (`drafts: true`), with the image library and menu sections.

## Prove a fork PR

The fork's "Publish (Preview)" workflow publishes every PR commit to [pkg.pr.new](https://pkg.pr.new). Nothing goes to npm.

1. Find the commit's build in that workflow's log, or use the PR's head commit sha.
2. On a branch here: `pnpm use-fork <sha>`, then commit `package.json` and the lockfile, and push. Vercel builds a preview.
3. Run the flow in the editor and capture it for the PR's Proof section.

## Environment

See `.env.example`. Unset `PUBLIC_KEYSTATIC_GITHUB_REPO` locally to edit local files with no drafts. Set every variable in Vercel for both Production and Preview, because draft branches build as previews.

`main` requires the `check` workflow, because Publish now waits for a required check.
