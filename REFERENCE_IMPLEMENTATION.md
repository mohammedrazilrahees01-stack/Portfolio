# 3D reference implementation notes

Reference repository: https://github.com/red1-for-hek/portfolio-website
Pinned revision: `e1491d6d709d4fa6df2ca88277f0c31b5e4f6ea7`
License: MIT; the reference licence text is included at `licenses/REFERENCE-PORTFOLIO-MIT-LICENSE.txt`.

The following actual reference files were inspected: `src/components/Character/Scene.tsx`, `src/components/Character/utils/character.ts`, `src/components/Character/utils/decrypt.ts`, `src/components/Character/utils/animationUtils.ts`, `src/components/Character/utils/lighting.ts`, `src/components/Character/utils/mouseUtils.ts`, `src/components/utils/GsapScroll.ts`, `src/components/utils/initialFX.ts`, `src/components/styles/Landing.css`, and `src/components/styles/Work.css`.

The portfolio now loads the real encrypted character asset and HDR environment from that pinned public repository at runtime, decrypts the model using the same Web Crypto approach as the source, and uses Three.js GLTF/DRACO/HDR loaders. Scroll progress is mapped to the local hero, services and work sections to reproduce the reference's scrubbed camera/model transitions; pointer movement drives a head/pose response. The desktop layer stays hidden until the remote character is fully decrypted and parsed. The earlier locally generated low-poly 3D substitute has been removed because it appeared briefly before the real character and looked like a misshaped second model. If the remote asset fails, a low-contrast atmospheric canvas plate remains instead; the separate illustrated Canvas character is reserved for smaller-screen layouts.

The portrait card retains the original Framer front/back visual treatment and a 100vh sticky stage. Its containing block is the full-height main page, so scroll progress, translation, 3D face rotation and the click/keyboard flip continue through the page rather than stopping in the opening section. The click/keyboard flip is interpolated with a separate target value, rather than snapping to the opposite face. The card front, header avatar and About image share the same local portrait source; the reverse face falls back to that local portrait if the secondary Framer source is unavailable. A bundled local animated film-grain GIF sits behind the content, alongside CSS grain and atmospheric motion.

Personal information, work history and project descriptions are based on Mohammed Razil Rahees's latest supplied CV and public repositories. The reference creator's identity and project titles are not copied into the portfolio content.
