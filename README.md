# Razil Rahees — Portfolio Website

A responsive, static, multi-page developer portfolio for **Mohammed Razil Rahees**. The site is deployable without a framework build or server-side API.

## Included

- Homepage with work, services, experience, skills, about, and contact sections.
- Eight local case-study pages plus a project directory and custom 404 page.
- Your CV PDF, local portrait files, project cover illustrations, local animated film-grain texture, favicon, SEO metadata, sitemap, and robots.txt.
- Scroll-driven portrait card across the homepage, a local photo shared with the header avatar, 3D face rotation, keyboard/click flip, and mobile portrait fallback.
- Desktop Three.js character scene adapted from the reference repository and MIT licence retained in `licenses/REFERENCE-PORTFOLIO-MIT-LICENSE.txt`. The desktop scene does not render a placeholder 3D figurine while the reference model loads. The 3D layer stays hidden until the reference model is ready; the mismatched low-poly stand-in is not shown while loading.
- Responsive navigation, reduced-motion styling, SEO/Open Graph metadata, structured data, and hosting headers for Vercel, Netlify and Apache.

## Run locally

Serve the extracted folder over HTTP rather than opening the page as `file://` because ES modules, Web Crypto and asset paths are designed for a server origin.

Python example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. VS Code Live Server also works.

## Deploy

### Vercel

Import the extracted folder into a repository, set the project root to the folder containing `index.html`, select **Other** as the framework preset, leave the build command empty, and use `.` as the output directory. The included `vercel.json` defines clean URLs, trailing slashes and response headers.

### Netlify / Cloudflare Pages

Publish the folder containing `index.html`, `404.html`, `assets/`, `projects/`, `robots.txt` and `sitemap.xml` as the static publish directory. `_headers` is included for hosts that support this format.

### Apache

Upload all files to the site document root. The included `.htaccess` provides `index.html` as the directory index, basic response headers and no directory listing.

## Domain configuration

The canonical domain in HTML metadata, `robots.txt` and `sitemap.xml` is currently `https://razilrahees.labezra.com/`, taken from the latest CV. **If you host under a different domain, update the canonical, `og:url`, `og:image`, JSON-LD `url`, `robots.txt` sitemap line and `sitemap.xml` before release.** Search for `razilrahees.labezra.com` to find all occurrences.

## 3D and animation behaviour

- The portrait rail spans the main page content and moves down progressively while the visitor scrolls. Its sticky stage follows the page on desktop and the portrait is available in the About section on narrower viewports.
- The header avatar and portrait-card front use the same local portrait source (`assets/razil-card-photo.jpg`, cropped to `assets/razil-avatar.png`).
- The reverse face attempts to load the original secondary Framer image and falls back to the same local portrait if the remote file is unavailable.
- The animated film-grain GIF is local (`assets/film-grain.gif`), so that background effect no longer depends on Framer's GIF CDN.
- Three.js and the reference character/HDR/DRACO assets are still fetched from the public CDN/reference repository. The desktop 3D layer stays hidden until the actual reference model loads, so a crude stand-in does not flash before it. If the 3D asset fails, the desktop keeps a quiet atmospheric canvas plate instead of showing a mismatched substitute; the animated Canvas character remains available on smaller screens. Use HTTPS in production for Web Crypto and ensure the host permits these outgoing asset requests.
- The scroll-linked motion remains active by design; ambient animation is reduced where supported under `prefers-reduced-motion`.

## Contact behaviour

The contact form validates its fields and opens a prefilled `mailto:` draft. It does not claim to POST to a server or store enquiries. A real server-backed form requires an email service/backend endpoint and its own configuration.

## Project destinations

- BuyHoreca and Brewing Edge link to their public Shopify destinations.
- Each project has a local case-study page and a GitHub source link where a public repository exists.
- Projects without a verified live deployment are labelled as in development/source available instead of receiving fabricated live URLs.

## QA

`QA_REPORT.md`, `PROJECT_LINKS.md`, and `RELEASE_CHECKLIST.md` document static checks, project destinations, hosting steps, and the live checks still required after deployment. The local source checks can confirm routes and syntax, but they cannot guarantee third-party CDN availability or replace a live-browser check on the final hosting domain.
