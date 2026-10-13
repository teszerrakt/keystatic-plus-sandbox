// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';
import { buildSidebar } from './src/sidebar.mjs';
import { locales } from './src/locales.mjs';

export default defineConfig({
	site: process.env.SITE_URL ?? 'http://localhost:4321',
	// Keystatic's editor and API routes render on demand; every docs page stays static.
	adapter: vercel(),
	// Markdown images get a srcset, so a phone downloads a phone-sized copy.
	image: { layout: 'constrained' },
	integrations: [
		react(),
		keystatic(),
		starlight({
			title: 'Plus Sandbox',
			description: 'A test site for the Keystatic plus fork.',
			defaultLocale: 'root',
			locales,
			sidebar: buildSidebar(),
		}),
	],
});
