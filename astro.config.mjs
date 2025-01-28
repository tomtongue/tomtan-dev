import { defineConfig } from 'astro/config';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'https://tomtan.dev',
    integrations: [
        mdx(), 
        sitemap(),
        tailwind({
            applyBaseStyles: false,
        })],
    markdown: {
        rehypePlugins: [ rehypeHeadingIds ],
    }
});