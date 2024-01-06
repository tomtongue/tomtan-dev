import { defineConfig } from 'astro/config';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://tomtan.dev',
	integrations: [mdx(), sitemap()],
	markdown: {
		rehypePlugins: [ rehypeHeadingIds ],
		shikiConfig: {
			theme: 'github-light'
		}
	}
});
