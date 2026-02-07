import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'https://tomtan.dev',
    integrations: [
        mdx({
            remarkPlugins: [],
            rehypePlugins: [],
        }),
        sitemap(),
        tailwind({
            applyBaseStyles: false,
        })],
    markdown: {
        // This applies to both .md and .mdx files
        extendDefaultPlugins: true,
    },
});