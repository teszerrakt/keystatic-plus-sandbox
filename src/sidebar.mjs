import { readdirSync, readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { locales } from './locales.mjs';

// Writers edit this in Keystatic (Menu sections). Labels are keyed by the
// language names in locales.mjs.
const SECTIONS_FILE = 'src/content/menu-sections.json';

// Section and order come from the English page; the Indonesian copy shares its
// slug, so Starlight shows it under the same group. Read once per build, so a
// page added while `npm run dev` runs shows up after a restart.
export function buildSidebar(dir = 'src/content/docs/help') {
	const { sections } = JSON.parse(readFileSync(SECTIONS_FILE, 'utf8'));
	const main = locales.root.label;
	const others = Object.entries(locales).filter(([key]) => key !== 'root');
	const pages = readdirSync(dir)
		.filter((f) => /\.mdx?$/.test(f))
		.map((f) => {
			const fm = parseYaml(readFileSync(`${dir}/${f}`, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') ?? {};
			return {
				slug: `help/${f.replace(/\.mdx?$/, '')}`,
				title: fm.title ?? f,
				section: sections.some((s) => s.id === fm.section) ? fm.section : sections[0]?.id,
				order: fm.sidebar?.order ?? 100,
			};
		});

	return sections
		.map((s) => ({
			label: s.label[main] || s.id,
			translations: Object.fromEntries(
				others.flatMap(([, l]) => (s.label[l.label] ? [[l.lang, s.label[l.label]]] : [])),
			),
			items: pages
				.filter((p) => p.section === s.id)
				.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
				.map((p) => ({ slug: p.slug })),
		}))
		.filter((g) => g.items.length > 0);
}
