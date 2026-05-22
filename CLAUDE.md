# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

This is a pure HTML/CSS learning project — no build tools, bundlers, or JavaScript. Open `index.html` directly in a browser to preview. There is no dev server command.

## Dependencies

`modern-normalize` is installed via npm and referenced via CDN in `index.html`. No build step is needed; the CDN link is what the browser loads.

## Structure

Single-page site with one HTML file and one CSS file:

- `index.html` — full page markup, top to bottom: header → hero → benefits → team → portfolio → footer
- `css/styles.css` — all styles, organized by section with labeled comment blocks matching the HTML sections

## CSS conventions

- Sections are delimited by comments: `/* --- SECTION NAME --- */` and `/* --- /SECTION NAME --- */`
- `.container` (max-width 1158px, auto margins) wraps content in every section
- Color palette: `#2e2f42` (dark navy), `#4d5ae5` (brand blue), `#434455` (body text), `#f4f4fd` (light bg), `#ffffff`
- Fonts: Roboto (body), Raleway (logo) — loaded from Google Fonts
- List items use `flex-basis: calc(100% - Npx) / N` pattern for equal-width columns (note: this is intentional shorthand, not computed CSS)
- `.benefits-section-title` is intentionally `display: none` (visually hidden but present for semantics)
