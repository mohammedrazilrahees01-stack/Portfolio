# Production release checklist

## Before publishing

- [ ] Confirm the production domain and replace `razilrahees.labezra.com` in canonical/social metadata, JSON-LD, robots and sitemap if needed.
- [ ] Upload the contents of this folder to the host document root (not an extra nested folder).
- [ ] Enable HTTPS and confirm the CDN can load `three@0.168.0`, the pinned reference model, HDR file and DRACO decoder.
- [ ] Confirm the `assets/Mohammed_Razil_Rahees_CV.pdf` download opens the intended CV.

## Browser QA after deployment

- [ ] Test at desktop widths of 1440 px and 1024 px; test phones at 390 px and 360 px.
- [ ] Verify the reference 3D model is entirely framed, does not obscure the headline, and appears after loading without an interim substitute doll. If WebGL/CDN loading fails, confirm the desktop keeps the clean atmospheric plate and mobile keeps its Canvas illustration.
- [ ] Scroll from top to footer: confirm the profile card progresses down the page, rotates through both faces, remains in its right-side gutter, and does not cover section content.
- [ ] Verify the same portrait appears in the header and front of the card; check the reverse-face fallback with the network disabled.
- [ ] Test keyboard navigation, visible focus, mobile menu open/close, anchor links, back-to-top link, and every project card/detail link.
- [ ] Submit the contact form with missing/invalid fields; then submit valid data and confirm the email draft opens with all fields populated.
- [ ] Check browser console and network panel for JS exceptions, failed local assets, 404s, and CORS errors.
- [ ] Inspect `robots.txt`, `sitemap.xml`, canonical URLs, Open Graph preview and the custom 404 page.
- [ ] Verify outbound links in a signed-out browser; confirm BuyHoreca and Brewing Edge destinations stay reachable.

## Important runtime note

The portfolio is static and has no build command or server API. The contact form is a `mailto:` handoff. The desktop 3D scene depends on external Three.js/CDN/model assets. The page keeps a calm atmospheric plate while loading or if the model fails; the separate Canvas character illustration is used on narrower screens. A successful ZIP/static audit does not by itself certify the externally hosted runtime.
