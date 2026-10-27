# Portfolio QA Report — No-ghost / layout correction

**Audit date:** 27 October 2026  
**Release type:** Static portfolio with a remote Three.js GLTF character and a Canvas fallback.

## Latest fixes

- Removed the locally generated low-poly 3D figurine from the desktop startup/failure paths. It was being displayed immediately, then replaced by the fetched reference GLTF, creating the visibly mismatched “shape before the real model” transition.
- The desktop 3D layer remains hidden until the pinned reference model has been fetched, decrypted and parsed. While it loads, the hero shows only a quiet ambient/ring/dust canvas plate and film grain. If the external model fails, the unrelated placeholder 3D figure is not shown; the clean atmospheric plate remains instead.
- Set the desktop 3D viewport to begin at 50–51% of the screen, reserving the left column for the headline and the right gutter for the scrolling portrait card. The hero headline has a 610px cap and the accent phrase starts on its own line at desktop widths.
- Header avatar and the portrait-card front use the same local portrait crop. The portrait card still has scroll-linked translation, a 3D flip, and click/keyboard interaction.
- Changed external links opened in new tabs to include `noopener noreferrer`.
- Bundled CV is byte-for-byte identical to the latest CV supplied in this conversation.

## Automated static checks

**Result: PASS for the checks below; no local reference or parser issues reported.**

- 11 HTML pages parsed. All have one `<title>` and one `<h1>`, unique IDs, and image `alt` text.
- 269 HTML references checked across page attributes. No missing local file paths or in-page anchors reported.
- 10 sitemap URLs; sitemap XML parses and every URL maps to a bundled HTML route.
- `assets/site.js` and `assets/scene3d.js` pass `node --check`.
- `assets/site.css` parses with `tinycss2` without CSS syntax errors.
- JSON-LD parses as JSON. Vercel configuration parses as JSON.
- All `target="_blank"` links inspected include `noopener noreferrer`.
- Required local assets exist, including CV PDF, portrait image, animated grain GIF, project covers, favicon, 404 page and MIT licence.
- ZIP contents and CRC integrity are checked separately before delivery.

## Runtime verification boundary

The external reference GLTF, HDR environment and DRACO decoder are still fetched from the pinned public GitHub revision; Three.js modules are loaded from jsDelivr. These requests require internet access and correct browser CORS behavior. This environment blocked Playwright navigation to the local preview URL, so it did not permit a live visual browser test of the final composition or the remote model load. Do not interpret static checks as proof that every remote dependency loaded or that every GPU/browser renders identically.

Before production traffic, open the extracted site over HTTPS and inspect: (1) the page at 1440px/1664px, (2) the portrait card while scrolling from the hero through the bottom, (3) the model-load state in a fresh session, (4) 1024px/390px/360px layouts, (5) the CV, all project links, and the contact email handoff, and (6) browser Console and Network failures.

## Domain

Canonical and sitemap URLs currently target `https://razilrahees.labezra.com/`, based on the latest CV. If the site will be hosted elsewhere, update canonical, Open Graph, JSON-LD, `robots.txt`, and `sitemap.xml` before deployment.
