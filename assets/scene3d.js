/*
 * Scroll-driven Three.js character scene adapted from the public MIT-licensed portfolio:
 * https://github.com/red1-for-hek/portfolio-website
 * Original reference uses Three.js, a decrypted GLTF character, character animation clips,
 * mouse-following head/neck rotation, HDR lighting and scrubbed scroll timelines.
 * This static build keeps the animation architecture, adapts it to Razil's page sections,
 * and uses the original licensed character as the only desktop 3D model. If it cannot load,
 * the scene remains hidden and a calm canvas atmosphere stays visible rather than flashing
 * an unrelated placeholder figurine.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

(() => {
  'use strict';
  const host = document.getElementById('character-canvas-host');
  const layer = document.getElementById('character-model');
  if (!host || !layer) return;
  const desktopViewport = window.matchMedia('(min-width: 1025px)');
  if (!desktopViewport.matches) {
    // The 2D canvas scene in site.js is the intentionally lighter mobile fallback.
    // Reload only when crossing the desktop breakpoint so orientation changes don't leave a blank hero.
    desktopViewport.addEventListener('change', () => window.location.reload(), { once: true });
    return;
  }
  desktopViewport.addEventListener('change', () => window.location.reload());
  const reduceIdle = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const REFERENCE = 'https://raw.githubusercontent.com/red1-for-hek/portfolio-website/e1491d6d709d4fa6df2ca88277f0c31b5e4f6ea7/public';

  let renderer, scene, camera, root, mixer, character, headBone, neckBone, monitor, screenLight;
  let raf = 0, disposed = false, pageVisible = !document.hidden, characterLoaded = false, modelFailed = false, animationLoop = null;
  let scrollTarget = 0, scrollCurrent = 0, mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
  let referenceFrame = null;
  const clock = new THREE.Clock();
  const materialPool = [];
  const geometries = [];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / Math.max(.0001, b - a)); return t * t * (3 - 2 * t); };
  const frameReferenceCharacter = () => {
    if (!character || !camera || !host) return;
    character.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(character);
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, rect.width || window.innerWidth * .52);
    const height = Math.max(1, rect.height || window.innerHeight);
    const fov = width <= 500 ? 29 : width <= 760 ? 26 : 23;
    const aspect = width / height;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    // Fit the entire GLTF inside the right-side scene instead of assuming the
    // reference model has the exact same dimensions as the developer's monitor.
    const distanceForHeight = size.y / Math.max(.001, 2 * tanHalf * .72);
    const distanceForWidth = size.x / Math.max(.001, 2 * tanHalf * aspect * .84);
    const distanceForDepth = size.z * 1.35;
    const distance = Math.max(distanceForHeight, distanceForWidth, distanceForDepth, 5);
    const viewOffsetX = size.x * .40;
    referenceFrame = { center, size, distance, fov, viewOffsetX };
    camera.fov = fov;
    camera.aspect = aspect;
    camera.position.set(center.x + viewOffsetX, center.y + size.y * .02, center.z + distance);
    camera.lookAt(center.x + viewOffsetX, center.y + size.y * .02, center.z);
    camera.updateProjectionMatrix();
  };
  const makeMaterial = (options) => { const m = new THREE.MeshStandardMaterial(options); materialPool.push(m); return m; };
  function initScene() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: Math.min(window.devicePixelRatio || 1, 2) < 2, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, .1, 150);
    camera.position.set(0, 2.25, 8.7); camera.lookAt(0, 1.18, 0);
    scene.add(new THREE.AmbientLight(0xd7e4df, 1.45));
    const key = new THREE.DirectionalLight(0xc7f078, 3.2); key.position.set(3, 6, 5); scene.add(key);
    const rim = new THREE.PointLight(0xbe8aff, 30, 22); rim.position.set(-3, 3, -1); scene.add(rim);
    const fill = new THREE.PointLight(0x5fd6a7, 18, 15); fill.position.set(3, 1, 4); scene.add(fill);
    root = new THREE.Group(); scene.add(root);

    // Fine floating dust and luminous orbit arcs help the scene retain cinematic depth.
    const dustCount = 220, positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) { positions[i * 3] = (Math.random() - .5) * 11; positions[i * 3 + 1] = (Math.random() - .5) * 7; positions[i * 3 + 2] = -2 - Math.random() * 5; }
    const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometries.push(dustGeo);
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xd7edbd, size: .017, transparent: true, opacity: .36, sizeAttenuation: true })); scene.add(dust);
    const haloGeo = new THREE.TorusGeometry(1.78, .008, 8, 160); geometries.push(haloGeo);
    const halo = new THREE.Mesh(haloGeo, makeMaterial({ color: 0xb8dca9, emissive: 0x385c36, emissiveIntensity: .32, transparent: true, opacity: .3 }));
    halo.position.set(.25, 1.45, -1.5); halo.rotation.set(1.12, .12, .28); scene.add(halo);
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, .005, 8, 160), makeMaterial({ color: 0xb9a4f4, emissive: 0x503a81, emissiveIntensity: .24, transparent: true, opacity: .18 }));
    halo2.position.copy(halo.position); halo2.rotation.set(.6, .3, -.2); scene.add(halo2);

    // The original portfolio's source setup uses the same camera start coordinates and tone mapping.
    camera.fov = 14.5; camera.position.set(0, 13.1, 24.7); camera.zoom = 1.1; camera.updateProjectionMatrix();
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('pointerleave', resetPointer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    handleScroll();
    const animate = () => {
      if (disposed || !pageVisible) { raf = 0; return; }
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const idle = reduceIdle ? .25 : 1;
      scrollCurrent += (scrollTarget - scrollCurrent) * (reduceIdle ? .18 : .085);
      mouseX += (targetMouseX - mouseX) * .045; mouseY += (targetMouseY - mouseY) * .045;
      const p = scrollCurrent;
      sectionScroll.hero += (sectionScrollTarget.hero - sectionScroll.hero) * .11;
      sectionScroll.about += (sectionScrollTarget.about - sectionScroll.about) * .09;
      sectionScroll.exit += (sectionScrollTarget.exit - sectionScroll.exit) * .11;
      const intro = sectionScroll.hero;
      const about = sectionScroll.about;
      const exit = sectionScroll.exit;
      // This follows the reference GsapScroll.ts choreography: turn during the hero, zoom in the
      // about interval, then lift the character out as the service/experience content takes over.
      if (referenceFrame) {
        const { center, size, distance, viewOffsetX } = referenceFrame;
        const targetY = center.y + size.y * .02 - size.y * .08 * about;
        const targetX = center.x + viewOffsetX - size.x * .035 * intro + size.x * .04 * about;
        camera.position.x = targetX;
        camera.position.y = targetY;
        camera.position.z = center.z + distance * lerp(1, 1.28, about) * lerp(1, .97, intro);
        camera.lookAt(targetX + size.x * .025 * about, targetY, center.z);
      }
      root.rotation.y = .04 + intro * .7 + about * .22 + Math.sin(t * .23) * .018 * idle;
      root.rotation.x = about * .12 + mouseY * .028 + Math.sin(t * .31) * .012 * idle;
      root.rotation.z = Math.sin(t * .17) * .014 * idle;
      root.position.x = lerp(0, -.25, intro) + lerp(0, .35, about);
      root.position.y = Math.sin(t * .8) * .025 * idle + about * .12;
      const layerX = lerp(0, -25, intro) + lerp(0, 13, about);
      const layerY = -100 * exit;
      layer.style.transform = `translate3d(${layerX.toFixed(2)}%,${layerY.toFixed(2)}%,0)`;
      layer.style.opacity = characterLoaded ? String(lerp(.97, .28, exit)) : '0';
      if (headBone) {
        // Head looks toward the visitor in the hero, then lowers towards the monitor after scrolling.
        headBone.rotation.y += ((mouseX * .42 * (1 - about) - .25 * about) - headBone.rotation.y) * .025;
        headBone.rotation.x += ((-mouseY * .15 - .36 * about) - headBone.rotation.x) * .025;
      }
      if (neckBone) neckBone.rotation.x += ((.6 * about) - neckBone.rotation.x) * .025;
      if (screenLight?.material) screenLight.material.opacity = lerp(0, 1, smooth(.14, .5, about));
      if (mixer) mixer.update(Math.min(clock.getDelta(), .05));
      dust.rotation.y = t * .012 * idle; dust.rotation.x = Math.sin(t * .15) * .025 * idle;
      halo.rotation.z = .28 + t * .025 * idle; halo2.rotation.y = .3 + t * .018 * idle;
      renderer.render(scene, camera);
    };
    animationLoop = animate;
    if (pageVisible && characterLoaded) animate();
  }

  function resize() {
    if (!renderer || !camera || !host) return;
    // The character canvas lives in the right-hand scene column on desktop. Size
    // the WebGL drawing buffer to that host; using full-window dimensions here
    // stretched the canvas and made the loaded character dominate the whole page.
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || window.innerWidth));
    const height = Math.max(1, Math.round(rect.height || window.innerHeight));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    if (character) frameReferenceCharacter();
    camera.updateProjectionMatrix();
  }
  // Map scroll position to named sections, mirroring the reference repository's
  // scrubbed landing -> about -> what-I-do timelines instead of diluting motion
  // across the entire document's scroll height.
  const sectionProgress = (selector, mode = 'top') => {
    const el = document.querySelector(selector);
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const height = Math.max(1, el.offsetHeight);
    let start = top, end = top + height;
    if (mode === 'center55') start = top + height * .5 - window.innerHeight * .55;
    if (mode === 'bottomTop') { start = top; end = top + height; }
    return clamp((window.scrollY - start) / Math.max(1, end - start));
  };
  let sectionScroll = { hero: 0, about: 0, exit: 0 };
  let sectionScrollTarget = { hero: 0, about: 0, exit: 0 };
  function handleScroll() {
    sectionScrollTarget = {
      hero: sectionProgress('.hero', 'bottomTop'),
      about: sectionProgress('#services', 'center55'),
      exit: sectionProgress('#work', 'bottomTop')
    };
    // Keep normalized scroll as a fallback for layouts without a matching section.
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollTarget = clamp(window.scrollY / max);
  }
  function handlePointer(e) {
    targetMouseX = ((e.clientX / Math.max(1, window.innerWidth)) - .5) * 2;
    targetMouseY = ((e.clientY / Math.max(1, window.innerHeight)) - .5) * -2;
  }
  function resetPointer() { targetMouseX = targetMouseY = 0; }
  function handleVisibility() {
    pageVisible = !document.hidden;
    if (!pageVisible && raf) { cancelAnimationFrame(raf); raf = 0; }
    else if (pageVisible && !raf && !disposed && !modelFailed && characterLoaded && animationLoop) raf = requestAnimationFrame(animationLoop);
  }

  async function decryptReferenceModel() {
    if (!globalThis.crypto?.subtle) throw new Error('Web Crypto unavailable; use HTTPS hosting.');
    const response = await fetch(`${REFERENCE}/models/character.enc`, { mode: 'cors', cache: 'force-cache' });
    if (!response.ok) throw new Error(`Reference model request failed (${response.status}).`);
    const encrypted = await response.arrayBuffer();
    if (encrypted.byteLength < 32) throw new Error('Reference model archive is incomplete.');
    const iv = new Uint8Array(encrypted.slice(0, 16));
    const pass = new TextEncoder().encode('Character3D#@');
    const hash = await crypto.subtle.digest('SHA-256', pass);
    const key = await crypto.subtle.importKey('raw', hash, { name: 'AES-CBC' }, false, ['decrypt']);
    return crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encrypted.slice(16));
  }

  function setupModelAnimations(gltf) {
    character = gltf.scene;
    root.clear();
    root.position.set(0, 0, 0);
    root.add(character);
    character.traverse(obj => {
      if (!obj.isMesh) return;
      obj.castShadow = false; obj.receiveShadow = false; obj.frustumCulled = true;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => { if (m) { m.precision = 'mediump'; m.needsUpdate = true; } });
    });
    headBone = character.getObjectByName('spine006') || null;
    neckBone = character.getObjectByName('spine005') || null;
    monitor = character.getObjectByName('Plane004') || null;
    screenLight = character.getObjectByName('screenlight') || null;
    if (monitor) monitor.traverse(child => { if (child.material) { child.material.transparent = true; child.material.opacity = 0; } });
    if (screenLight?.material) { screenLight.material.transparent = true; screenLight.material.opacity = 0; screenLight.material.emissive?.set('#C8BFFF'); }
    const footR = character.getObjectByName('footR'), footL = character.getObjectByName('footL');
    if (footR) footR.position.y = 3.36;
    if (footL) footL.position.y = 3.36;
    mixer = new THREE.AnimationMixer(character);
    const clips = gltf.animations || [];
    const introClip = THREE.AnimationClip.findByName(clips, 'introAnimation');
    if (introClip) { const action = mixer.clipAction(introClip); action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play(); }
    ['key1', 'key2', 'key5', 'key6', 'typing'].forEach(name => {
      const clip = THREE.AnimationClip.findByName(clips, name);
      if (clip && (!introClip || clip !== introClip)) { const action = mixer.clipAction(clip); action.setLoop(THREE.LoopRepeat, Infinity); action.timeScale = name === 'typing' ? 1.15 : 1; action.play(); }
    });
    const blink = THREE.AnimationClip.findByName(clips, 'Blink');
    if (blink) { const action = mixer.clipAction(blink); action.setLoop(THREE.LoopRepeat, Infinity); action.timeScale = .4; action.play(); }
    characterLoaded = true;
    modelFailed = false;
    layer.classList.remove('character-load-failed');
    layer.classList.add('character-loaded');
    layer.style.visibility = 'visible';
    resize();
    document.body.classList.add('webgl-character-ready');
    window.__threeHeroReady = true;
    window.dispatchEvent(new Event('three-hero-ready'));
    if (!raf && pageVisible && animationLoop) raf = requestAnimationFrame(animationLoop);
  }

  function loadHdrEnvironment() {
    const loader = new RGBELoader();
    loader.load(`${REFERENCE}/models/char_enviorment.hdr`, texture => {
      if (disposed || !scene) { texture.dispose(); return; }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = .52;
      scene.environmentRotation.set(5.76, 1.5, 1);
    }, undefined, () => { /* Local lights already provide a graceful HDR fallback. */ });
  }


  try {
    initScene();
    // Keep the 3D layer hidden while the licensed reference model loads. The calmer
    // canvas atmosphere remains visible during loading; never flash a crude stand-in rig.
    layer.classList.remove('character-loaded', 'character-load-failed');
    layer.style.opacity = '0';
    layer.style.visibility = 'hidden';
    loadHdrEnvironment();
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${REFERENCE}/draco/`); draco.setDecoderConfig({ type: 'js' });
    const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
    const timeout = window.setTimeout(() => {
      if (!characterLoaded && !disposed) {
        modelFailed = true;
        layer.classList.add('character-load-failed');
        layer.style.opacity = '0';
        layer.style.visibility = 'hidden';
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        // Leave the lightweight canvas atmosphere in place rather than swapping
        // to a visibly different/low-quality 3D doll.
      }
    }, 9000);
    decryptReferenceModel().then(buffer => new Promise((resolve, reject) => {
      if (disposed) return resolve();
      loader.parse(buffer, `${REFERENCE}/models/`, gltf => { setupModelAnimations(gltf); resolve(); }, reject);
    })).then(() => window.clearTimeout(timeout)).catch(err => {
      console.warn('Reference 3D character unavailable; keeping the clean canvas fallback.', err);
      window.clearTimeout(timeout);
      if (!characterLoaded && !disposed) {
        modelFailed = true;
        layer.classList.add('character-load-failed');
        layer.style.opacity = '0';
        layer.style.visibility = 'hidden';
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
    }).finally(() => draco.dispose());
    window.addEventListener('pagehide', () => {
      disposed = true; if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointer); window.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
      geometries.forEach(g => g.dispose()); materialPool.forEach(m => m.dispose());
    }, { once: true });
  } catch (err) {
    console.warn('3D scene initialization failed; the clean canvas fallback remains visible.', err);
    layer.classList.remove('character-loaded');
    modelFailed = true;
    layer.classList.add('character-load-failed');
    layer.style.opacity = '0';
    layer.style.visibility = 'hidden';
  }
})();
