# tomtan.dev

[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-deployed-orange?logo=cloudflare)](https://tomtan.dev)

A personal blog website built with AstroJS for publishing blog posts.

Blog posts are written in MDX, with reusable Astro components and layouts for presentation and Tailwind CSS for styling.

## Draft Posts

Set `draft: true` in a post's frontmatter to exclude it from production builds, post lists, tags, RSS, and the sitemap. Drafts can still be previewed at their `/blog/<slug>/` URL with `npm run dev`. Omit `draft` or set it to `false` to publish the post.

Files in `public/` are always copied to `dist/`, including images referenced by drafts.

## Local Development

Use the Node.js version specified in [`.node-version`](.node-version). Run the following commands from the repository root.

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

   Open the URL printed in the terminal (usually [http://localhost:4321](http://localhost:4321)) and check your changes in the browser. The site updates as you edit files. Press `Ctrl+C` to stop the server.

3. Build the site for production:

   ```sh
   npm run build
   ```

   The generated site is written to `dist/`. Resolve any build errors before proceeding.

4. Preview the production build locally:

   ```sh
   npm run preview
   ```

   Open the URL printed in the terminal and verify the affected pages. Run `npm run build` again after making further changes to update the preview.
