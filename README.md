# Prasiddha Mainali — Portfolio

Professional portfolio with an interactive 3D neural sculpture, selected AI projects, experience, awards, and writing.

## Preview locally

Run `python -m http.server 8000` from this repository, then open http://localhost:8000.

## Structure

- `index.html`: homepage, experience, awards, contact links
- `style.css`: shared design and responsive layouts
- `app.js`: project dialogs, clipboard controls, and interactive 3D sculpture
- `icon.svg`: current favicon
- `blogs.html`: filterable journal index
- `blogs/`: eight articles
- `writing.css`: article layouts
- `sitemap.xml`: sitemap for the existing Render domain

## Deployment

This is a static website with no build step. Publish the repository root (`.`), not a `dist` folder. The existing root layout is preserved for Render and GitHub Pages. No server, npm installation, API keys, or secrets are required. Google Fonts is optional; system fonts provide fallbacks.

## Features

- WebGL-rendered reflective 3D neural core with drag rotation and motion controls
- Reduced-motion support and responsive layouts
- Accessible project dialogs and working email/social links
- Updated National Rank 2 and IOAI Honorable Mention
- Two preserved articles and six new essays / humor pieces with category filters and reading progress

Project artwork is illustrative, not product screenshots. Nidaan is credited as a collaborative/forked project. Contact uses email links rather than an unconnected form.

Previous website files remain recoverable through Git history.


## Interactive edition

`experience.css` provides the visual upgrade. `scene.js` renders the interactive 3D core with a static fallback when WebGL is unavailable. `experience.js` controls the skippable session-based entrance, story filters, reading progress, and original procedural ambient synth audio. Audio is off by default and requires a click to enable. Reduced-motion preferences skip the entrance and pause automatic 3D rotation. The audio pauses when the tab is hidden.

The two humorous posts are explicitly fictional. New essays do not introduce invented personal experiences or achievements.
