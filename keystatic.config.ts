import { config, collection, fields, singleton } from '@keystatic/core';

// "owner/name" on Vercel turns on GitHub mode, so every save is a commit.
// Unset, the editor writes straight to the local files (dev only, no drafts).
const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;
// A draft branch's Vercel preview; the fork fills in {alias}.
const draftPreview = import.meta.env.PUBLIC_DRAFT_PREVIEW_URL as string | undefined;
const siteUrl = import.meta.env.SITE_URL as string | undefined;
// On unless set to "false", to show standard Keystatic saves for a fork PR's proof.
const drafts = import.meta.env.PUBLIC_KEYSTATIC_DRAFTS !== 'false';

// Each group is a language (English, Indonesian, Simplified Chinese); its name keys the section labels (see src/locales.mjs).
const navigation = {
	English: ['docsEn' as const],
	'Bahasa Indonesia': ['docsId' as const],
	'简体中文': ['docsZh' as const],
};

// Section and menu position live on the English page only; the Indonesian copy
// follows it (see src/sidebar.mjs).
const menuFields = {
	section: fields.menuSection({
		label: 'Menu section',
		singleton: 'menuSections',
		defaultValue: 'getting-started',
	}),
	sidebar: fields.object({
		order: fields.menuOrder({ label: 'Place in the menu' }),
	}),
};

const docsCollection = (label: string, dir: string, withMenu: boolean) =>
	collection({
		label,
		slugField: 'title',
		path: `src/content/docs/${dir}/*`,
		previewUrl: draftPreview ? `${draftPreview}/${dir}/{slug}/` : undefined,
		format: { contentField: 'content' },
		entryLayout: 'content',
		columns: ['title'],
		schema: {
			title: fields.slug({ name: { label: 'Title' } }),
			description: fields.text({ label: 'Description', multiline: true }),
			...(withMenu ? menuFields : {}),
			content: fields.markdoc({
				label: 'Content',
				extension: 'md',
				options: {
					heading: [2, 3, 4],
					// The path is relative to the page, so it depends on how deep `dir` sits.
					image: {
						directory: 'src/assets/images/docs',
						publicPath: `${'../'.repeat(2 + dir.split('/').length)}assets/images/docs/`,
						library: true,
					},
				},
			}),
		},
	});

export default config({
	storage: repo
		? {
				kind: 'github',
				repo,
				branchPrefix: 'draft/',
				drafts,
				draftPreviewUrl: draftPreview,
				siteUrl,
			}
		: { kind: 'local' },
	ui: {
		brand: { name: 'Plus Sandbox' },
		navigation,
	},
	collections: {
		docsEn: docsCollection('Pages (English)', 'help', true),
		docsId: docsCollection('Halaman (Bahasa Indonesia)', 'id/help', false),
		docsZh: docsCollection('页面（简体中文）', 'zh-cn/help', false),
	},
	singletons: {
		menuSections: singleton({
			label: 'Menu sections',
			path: 'src/content/menu-sections',
			format: { data: 'json' },
			schema: {
				sections: fields.array(
					fields.object({
						id: fields.text({ label: 'ID' }),
						label: fields.object(
							Object.fromEntries(Object.keys(navigation).map((l) => [l, fields.text({ label: l })])),
						),
					}),
					{ label: 'Sections', itemLabel: (props) => props.fields.id.value },
				),
			},
		}),
	},
});
