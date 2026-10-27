(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const toggle=$('.menu-toggle'),nav=$('.nav-links');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});$$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls=$$('.reveal');
if(!reduced&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});revealEls.forEach(el=>io.observe(el));}else revealEls.forEach(el=>el.classList.add('visible'));
// Accessible active section cue for the long one-page portfolio.
if('IntersectionObserver'in window){const sections=$$('main section[id]');const linkMap=new Map($$('.nav-links a[href*="#"]').map(a=>{try{return [new URL(a.getAttribute('href'),window.location.href).hash.slice(1),a]}catch(_){return ['',a]}}).filter(([id])=>id));const sio=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){linkMap.forEach(a=>a.classList.remove('active'));const a=linkMap.get(e.target.id);if(a)a.classList.add('active')}}),{rootMargin:'-30% 0px -60% 0px'});sections.forEach(s=>sio.observe(s));}
// Real mailto handoff; no fake endpoint, third-party form service, or API secret.
const form=$('#contact-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const subject=encodeURIComponent('Portfolio enquiry — '+String(data.get('name')||'New contact'));const body=encodeURIComponent('Name: '+data.get('name')+'\nEmail: '+data.get('email')+'\nProject: '+(data.get('service')||'Not specified')+'\n\n'+data.get('message'));window.location.href='mailto:mohammedrazilrahees01@gmail.com?subject='+subject+'&body='+body;const status=$('#form-status');if(status)status.textContent='Your email draft is opening in your mail app. If it does not open, email mohammedrazilrahees01@gmail.com directly.';});}
$$('[data-copy-email]').forEach(b=>b.addEventListener('click',async()=>{const status=$('#copy-status');try{await navigator.clipboard.writeText('mohammedrazilrahees01@gmail.com');if(status)status.textContent='Email copied.';}catch(_){if(status)status.textContent='Email: mohammedrazilrahees01@gmail.com';}}));
const year=$('#year');if(year)year.textContent=String(new Date().getFullYear());
// Responsive Canvas illustration for smaller screens. On desktop, show only its atmospheric plate while the reference 3D character loads, to avoid a mismatched second figure.
const canvas=$('#hero-canvas');
if(canvas){
  const ctx=canvas.getContext('2d',{alpha:true});
  if(ctx){
    let w=0,h=0,dpr=1,raf=0,t=0,mouseX=0,mouseY=0,targetX=0,targetY=0,active=true,webglReady=false;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktopScene=window.matchMedia('(min-width: 1025px)').matches;
    window.addEventListener('three-hero-ready',()=>{webglReady=true;canvas.classList.add('fallback-replaced');if(raf)cancelAnimationFrame(raf);raf=0;},{once:true});
    function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,1.7);canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}resize();window.addEventListener('resize',resize,{passive:true});
    const wrap=canvas.closest('.hero-visual');if(wrap){wrap.addEventListener('pointermove',e=>{const r=wrap.getBoundingClientRect();targetX=(e.clientX-r.left)/Math.max(1,r.width)-.5;targetY=(e.clientY-r.top)/Math.max(1,r.height)-.5},{passive:true});wrap.addEventListener('pointerleave',()=>{targetX=targetY=0},{passive:true});}
    const dust=Array.from({length:56},()=>({x:Math.random(),y:Math.random(),r:.5+Math.random()*1.5,v:.0002+Math.random()*.00065,p:Math.random()*Math.PI*2}));
    function rounded(x,y,ww,hh,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
    function draw(){if(webglReady||!active){raf=0;return;}t+=reduced?.002:.008;mouseX+=(targetX-mouseX)*.045;mouseY+=(targetY-mouseY)*.045;ctx.clearRect(0,0,w,h);
      const narrow=w<420,scale=Math.min(w,h)*(narrow?.105:.145),cx=w*.53+mouseX*w*.025,cy=h*.54;
      // Atmospheric halo, floor rings, drifting particulate and soft volumetric beam.
      const halo=ctx.createRadialGradient(cx,cy*.85,2,cx,cy*.85,scale*4.5);halo.addColorStop(0,'rgba(180,119,244,.19)');halo.addColorStop(.44,'rgba(117,207,151,.075)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
      ctx.save();ctx.translate(cx,cy+scale*1.3);ctx.scale(1,.26);for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(0,0,scale*(2.4+i*.42),scale*(2.1+i*.38),-.08,0,Math.PI*2);ctx.strokeStyle=`rgba(177,211,167,${.11-i*.016})`;ctx.lineWidth=1;ctx.stroke()}ctx.restore();
      dust.forEach(d=>{d.y-=d.v*(reduced?.4:1);if(d.y<-.02){d.y=1.02;d.x=Math.random()}ctx.beginPath();ctx.arc(d.x*w,d.y*h,d.r,0,Math.PI*2);ctx.fillStyle=`rgba(205,239,191,${.12+.15*(.5+.5*Math.sin(t+d.p))})`;ctx.fill()});
      // On desktop, do not briefly show a second, hand-drawn person while the
      // real animated GLTF scene is loading. Keep only the quiet atmospheric plate.
      if(desktopScene){
        const vignette=ctx.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.2,w*.5,h*.5,Math.max(w,h)*.72);vignette.addColorStop(.55,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(2,5,4,.42)');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
        raf=requestAnimationFrame(draw);return;
      }
      ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.rotate(mouseX*.04);
      // Chair silhouette and cast shadow.
      ctx.fillStyle='rgba(2,6,5,.38)';ctx.beginPath();ctx.ellipse(0,5.7,4.3,.65,0,0,Math.PI*2);ctx.fill();
      const chair=ctx.createLinearGradient(-1.7,1,1.3,5);chair.addColorStop(0,'#34333f');chair.addColorStop(1,'#141b1c');rounded(-1.55,1.1,3.1,3.2,.55,chair,'rgba(220,235,220,.16)');
      // Legs and shoes in a seated posture.
      ctx.lineCap='round';ctx.strokeStyle='#27313a';ctx.lineWidth=.62;ctx.beginPath();ctx.moveTo(-.65,3.3);ctx.lineTo(-1.25,4.8);ctx.lineTo(-.55,5.3);ctx.moveTo(.58,3.3);ctx.lineTo(1.18,4.8);ctx.lineTo(.58,5.3);ctx.stroke();
      rounded(-1.05,5.0,.92,.42,.18,'#151a20');rounded(.2,5.0,.92,.42,.18,'#151a20');
      // Torso and shoulders, with a clear stylized 3D silhouette.
      const jacket=ctx.createLinearGradient(-1.25,-.1,1.2,2.4);jacket.addColorStop(0,'#403a50');jacket.addColorStop(.55,'#252a31');jacket.addColorStop(1,'#171f20');
      ctx.fillStyle=jacket;ctx.beginPath();ctx.moveTo(-1.35,.1);ctx.quadraticCurveTo(-1.65,-.35,-1.05,-.75);ctx.lineTo(-.5,-1.05);ctx.lineTo(.5,-1.05);ctx.lineTo(1.08,-.75);ctx.quadraticCurveTo(1.68,-.28,1.35,.12);ctx.lineTo(1.07,2.2);ctx.quadraticCurveTo(0,2.65,-1.05,2.2);ctx.closePath();ctx.fill();
      ctx.fillStyle='#88d8a5';ctx.beginPath();ctx.moveTo(-.42,-.86);ctx.lineTo(0,-.45);ctx.lineTo(.42,-.86);ctx.lineTo(.18,.65);ctx.lineTo(-.18,.65);ctx.closePath();ctx.fill();
      // Neck and head track the pointer, blinking/typing movement is softly looped.
      ctx.fillStyle='#936a57';rounded(-.26,-1.35,.52,.68,.18,'#936a57');
      ctx.save();ctx.translate(mouseX*.23,Math.sin(t*1.4)*.025);ctx.rotate(mouseX*.13);
      const face=ctx.createLinearGradient(-.58,-3,-.04,-1);face.addColorStop(0,'#b1846a');face.addColorStop(1,'#775142');ctx.fillStyle=face;ctx.beginPath();ctx.ellipse(0,-2.12,.58,.75,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#15171b';ctx.beginPath();ctx.ellipse(-.06,-2.61,.62,.43,-.04,Math.PI,Math.PI*2);ctx.lineTo(.56,-2.04);ctx.quadraticCurveTo(.38,-2.44,.02,-2.33);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(45,29,25,.55)';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(-.25,-1.88);ctx.lineTo(-.12,-1.84);ctx.moveTo(.12,-1.84);ctx.lineTo(.26,-1.88);ctx.stroke();
      ctx.fillStyle='#101516';ctx.beginPath();ctx.arc(-.22,-2.13,.055,0,Math.PI*2);ctx.arc(.2,-2.13,.055,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(55,29,26,.7)';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(-.09,-1.86);ctx.quadraticCurveTo(0,-1.81,.1,-1.86);ctx.stroke();ctx.restore();
      // Arms angle down towards the keyboard; offsets create the original typing rhythm.
      const type=reduced?0:Math.sin(t*7)*.09;
      ctx.lineCap='round';ctx.lineWidth=.47;ctx.strokeStyle='#292d3a';ctx.beginPath();ctx.moveTo(-1.08,-.48);ctx.quadraticCurveTo(-1.15,.12,-.67,.48+type);ctx.lineTo(-.28,.91+type);ctx.moveTo(1.08,-.48);ctx.quadraticCurveTo(1.15,.12,.67,.48-type);ctx.lineTo(.28,.91-type);ctx.stroke();
      ctx.fillStyle='#9c725d';ctx.beginPath();ctx.arc(-.28,.92+type,.17,0,Math.PI*2);ctx.arc(.28,.92-type,.17,0,Math.PI*2);ctx.fill();
      // Desk hardware and glowing monitor.
      const monitor=ctx.createLinearGradient(-1.12,-.6,1.12,-.6);monitor.addColorStop(0,'#30363b');monitor.addColorStop(.5,'#121b1b');monitor.addColorStop(1,'#252b30');rounded(-1.2,-.65,2.4,1.62,.12,monitor,'rgba(222,239,223,.25)');
      const screen=ctx.createLinearGradient(-.96,-.5,.9,.8);screen.addColorStop(0,'#152724');screen.addColorStop(.5,'#193f33');screen.addColorStop(1,'#101a1a');rounded(-1.03,-.5,2.06,1.28,.04,screen,'rgba(138,218,171,.48)');
      ctx.save();ctx.shadowBlur=12;ctx.shadowColor='rgba(127,231,165,.42)';ctx.fillStyle='rgba(157,240,182,.72)';for(let i=0;i<6;i++){rounded(-.81+i%2*.18,-.27+i*.15,.8+(i%3)*.12,.035,.02,'rgba(157,240,182,'+(.55-i*.045)+')')}ctx.restore();
      ctx.fillStyle='#6f7775';ctx.beginPath();ctx.moveTo(-.2,.98);ctx.lineTo(.2,.98);ctx.lineTo(.32,1.48);ctx.lineTo(-.32,1.48);ctx.closePath();ctx.fill();
      const table=ctx.createLinearGradient(-3.1,1.3,3.1,1.8);table.addColorStop(0,'#252b29');table.addColorStop(.45,'#444843');table.addColorStop(1,'#171e1c');ctx.fillStyle=table;ctx.beginPath();ctx.moveTo(-3.1,1.4);ctx.lineTo(3.1,1.4);ctx.lineTo(2.72,1.78);ctx.lineTo(-2.72,1.78);ctx.closePath();ctx.fill();
      ctx.fillStyle='#151b1a';ctx.fillRect(-2.55,1.78,.17,2.1);ctx.fillRect(2.38,1.78,.17,2.1);
      rounded(-1.2,1.22,1.35,.18,.06,'#202d2c','rgba(199,240,120,.18)');for(let y=0;y<3;y++)for(let x=0;x<12;x++){ctx.fillStyle=`rgba(203,234,202,${.22+((x+y)%3)*.08})`;ctx.fillRect(-1.08+x*.1,1.245+y*.042,.06,.018)}
      rounded(.58,1.22,.36,.17,.05,'#151a1d','rgba(199,240,120,.18)');
      ctx.restore();
      // Filmic vignette over the fallback illustration.
      const vignette=ctx.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.2,w*.5,h*.5,Math.max(w,h)*.72);vignette.addColorStop(.55,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(2,5,4,.55)');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
      raf=requestAnimationFrame(draw);
    }
    const vis=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active&&!raf&&!webglReady)draw();else if(!active&&raf){cancelAnimationFrame(raf);raf=0;}},{threshold:0});vis.observe(canvas);draw();
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);vis.disconnect();},{once:true});
  }
}
// Subtle 3D card tilt: only on pointer-fine screens and never on touch/reduced-motion devices.
if(!reduced&&matchMedia('(pointer:fine)').matches){$$('[data-tilt]').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateX(${-y*3.2}deg) rotateY(${x*3.8}deg) translateY(-3px)`;},{passive:true});card.addEventListener('pointerleave',()=>card.style.transform='');});}
})();
(()=>{
'use strict';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
// Scroll-driven portrait sequence adapted from the original Framer export:
// full-main-height rail + 100vh sticky stage + perspective reveal/turn/exit.
const portraitRail=$('.portrait-traveler');
const portraitStage=$('.portrait-card-stage');
const portraitGroup=$('#portrait-card-group');
const portraitCard=$('#portrait-card');
const portraitInner=$('#portrait-card-inner');
if(portraitRail&&portraitStage&&portraitGroup&&portraitCard&&portraitInner){
  // Enable the motion-only hidden entry state only when the controller is present; without JS the portrait remains visible.
  document.documentElement.classList.add('portrait-motion-ready');
  let current=0,target=0,flipped=false,flipCurrent=0,flipTarget=0,raf=0;
  const introStarted=performance.now();
  const introDuration=1050;
  const clamp01=v=>Math.min(1,Math.max(0,v));
  const smoothstep=(a,b,x)=>{const t=clamp01((x-a)/Math.max(.0001,b-a));return t*t*(3-2*t)};
  const lerp=(a,b,t)=>a+(b-a)*t;
  const getProgress=()=>{
    const rect=portraitRail.getBoundingClientRect();
    const railDocumentTop=rect.top+window.scrollY;
    const travel=Math.max(1,portraitRail.offsetHeight-window.innerHeight);
    return clamp01((window.scrollY-railDocumentTop)/travel);
  };
  const paint=()=>{
    raf=0;
    target=getProgress();
    current+=(target-current)*.12;
    if(Math.abs(target-current)<.0007)current=target;
    const introProgress=smoothstep(0,1,clamp01((performance.now()-introStarted)/introDuration));
    const enter=Math.max(smoothstep(0,.15,current),introProgress);
    const leave=smoothstep(.91,1,current);
    // Card comes in from above, grows into a 3D portrait, turns to reveal the back,
    // then travels down and out at the end of the original 3-viewport sticky track.
    const y=lerp(0,52,current);
    const scale=lerp(.1,1,enter)*lerp(1,.92,leave);
    const xRot=lerp(-180,0,enter)+38*leave;
    const zRot=lerp(-8,0,enter)+Math.sin(current*Math.PI*2)*6+leave*8;
    const opacity=Math.min(1,enter)* (1-.86*leave);
    flipCurrent+=(flipTarget-flipCurrent)*.16;
    if(Math.abs(flipTarget-flipCurrent)<.35)flipCurrent=flipTarget;
    const spin=360*smoothstep(.08,.88,current)+flipCurrent;
    const cardTilt=Math.sin(current*Math.PI*2)*4.5;
    portraitGroup.style.transform=`translate3d(0,${(y*window.innerHeight/100).toFixed(2)}px,0) perspective(1200px) rotateX(${xRot.toFixed(2)}deg) rotateZ(${zRot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    portraitGroup.style.opacity=String(opacity.toFixed(4));
    portraitInner.style.transform=`rotateY(${spin.toFixed(2)}deg) rotateX(${cardTilt.toFixed(2)}deg)`;
    portraitGroup.style.setProperty('--scroll-progress',String(current));
    portraitStage.style.setProperty('--scroll-progress',String(current));
    if(Math.abs(target-current)>.0007 || performance.now()-introStarted<introDuration || Math.abs(flipTarget-flipCurrent)>.35)raf=requestAnimationFrame(paint);
  };
  const queue=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  window.addEventListener('load',queue,{once:true});
  portraitCard.addEventListener('click',()=>{flipped=!flipped;flipTarget=flipped?180:0;portraitCard.setAttribute('aria-pressed',String(flipped));queue()});
  portraitCard.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();portraitCard.click()}});
  $$('.portrait-card-face img').forEach(img=>{
    img.addEventListener('error',()=>{
      if(img.dataset.localFallback&&!img.dataset.fallbackAttempted){
        img.dataset.fallbackAttempted='true';
        img.removeAttribute('srcset');
        img.src=img.dataset.localFallback;
        return;
      }
      const face=img.closest('.portrait-card-face');
      face?.classList.add('image-failed');
      img.remove();
    });
    if(img.complete&&img.naturalWidth===0){
      if(img.dataset.localFallback&&!img.dataset.fallbackAttempted){
        img.dataset.fallbackAttempted='true';img.removeAttribute('srcset');img.src=img.dataset.localFallback;
      }else{const face=img.closest('.portrait-card-face');face?.classList.add('image-failed');}
    }
  });
  queue();
}

// Local fallback for the About-section portrait if Framer's original CDN is blocked.
const aboutPortrait=$('.about-portrait-img');
if(aboutPortrait){
  aboutPortrait.addEventListener('error',()=>{
    if(aboutPortrait.dataset.localFallback&&!aboutPortrait.dataset.fallbackAttempted){
      aboutPortrait.dataset.fallbackAttempted='true';
      aboutPortrait.src=aboutPortrait.dataset.localFallback;
    }
  });
}

})();
