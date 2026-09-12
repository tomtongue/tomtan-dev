# Project Instructions

## Project

Read [README.md](README.md) first to understand this repository's purpose and overview. Check `package.json`, `package-lock.json`, and `astro.config.mjs` for the current versions and integrations.

## Astro Documentation

- Before implementing or changing Astro-specific behavior, consult the official Astro documentation through the `astro-docs` MCP server using its `search_astro_docs` tool. Search for the relevant feature and use the returned documentation to guide the implementation.
- Check that the documented APIs and examples match the Astro version used by this project. Consult the documentation again when framework behavior or compatibility is unclear.
- The MCP endpoint is `https://mcp.docs.astro.build/mcp`. Codex configuration is in `.codex/config.toml`; Claude Code configuration is in `.mcp.json`.
- If the MCP server is unavailable, report the limitation and consult the [official Astro documentation](https://docs.astro.build/) directly. Do not claim to have checked MCP documentation when the tool did not succeed.

## Development

- Install dependencies with `npm ci`.
- Run the development server with `npm run dev`.
- After changes that affect the website, run `npm run build` and check the affected pages as appropriate.

## Implementation Guidelines

- Fully implement the requested functionality with the minimum code necessary.
- Before adding tests, determine whether they are truly necessary. If they are, add only the minimal set of tests needed to validate the behavior, without duplication or excessive testing.
- Avoid unnecessary comments.

## Subagents

- When spawning a subagent, use the same model as the parent agent. Do not use a lower-capability model.
