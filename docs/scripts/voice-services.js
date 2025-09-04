// scripts/voice-services.js
// Page-specific logic for Voice-Only Services (BYO Hardware)

// ------- BYO Calculator -------
(() => {
  const BASE_FEE_MONTHLY = 150; // PBX platform (monthly)
  const PER_EXT_MONTHLY  = 65;  // per extension (monthly)
  const ONCE_OFF_FREE    = 0;   // installation free

  const extInput  = document.getElementById('vs-ext');
  const decBtn    = document.getElementById('ext-dec');
  const incBtn    = document.getElementById('ext-inc');
  const onceOffEl = document.getElementById('vs-total-onceoff');
  const monthlyEl = document.getElementById('vs-total-monthly');
  const portBtn   = document.getElementById('vs-porting-btn');

  const R = (num) => 'R ' + Number(num || 0).toLocaleString('en-ZA');

  function clampExt(n){
    const x = parseInt(String(n || '').replace(/\D+/g,''), 10);
    return Number.isFinite(x) && x > 0 ? x : 1;
  }

  function startFreshOrder(){
    try {
      localStorage.removeItem('voip:selectedPackage');
      localStorage.removeItem('voip:customBuild');
      localStorage.removeItem('voip:virtualNumber');
    } catch {}
  }

  function persistForNextSteps(ext, monthly, onceoff){
    startFreshOrder();
    const payload = {
      label: `Voice-only (BYO) — ${ext} extension${ext>1?'s':''}`,
      name:  'Voice-only (BYO)',
      monthly,
      onceOff: onceoff,
      extensions: ext,
      isVoiceOnly: true,
      tags: ['voice-only'],
      devices: [],
      minutesIncluded: null,
      meta: { mode:'byoh' }
    };
    try { localStorage.setItem('voip:selectedPackage', JSON.stringify(payload)); } catch {}
    try { localStorage.setItem('voip:customBuild', JSON.stringify([])); } catch {}
  }

  function updatePortingLink(ext, monthly, onceoff){
    const params = new URLSearchParams({
      mode: 'byoh',
      ext: String(ext),
      monthly: String(monthly),
      onceoff: String(onceoff)
    });
    if (portBtn) portBtn.href = 'porting.html?' + params.toString();
  }

  function recalc(){
    const ext = clampExt(extInput?.value);
    if (extInput && String(extInput.value) !== String(ext)) extInput.value = String(ext);
    const monthly = BASE_FEE_MONTHLY + (PER_EXT_MONTHLY * ext);
    const onceoff = ONCE_OFF_FREE;

    if (monthlyEl) monthlyEl.textContent = R(monthly);
    if (onceOffEl) onceOffEl.textContent = R(onceoff);

    persistForNextSteps(ext, monthly, onceoff);
    updatePortingLink(ext, monthly, onceoff);
  }

  decBtn?.addEventListener('click', ()=>{ extInput.value = Math.max(1, clampExt(extInput.value) - 1); recalc(); extInput.focus(); });
  incBtn?.addEventListener('click', ()=>{ extInput.value = clampExt(extInput.value) + 1; recalc(); extInput.focus(); });
  extInput?.addEventListener('input', recalc);

  recalc();
})();

// ------- Segmented tabs (mobile-friendly + a11y) -------
(() => {
  const segmented = document.getElementById('segmented');
  if (!segmented) return;

  const segInner = segmented.querySelector('.seg-inner');
  const pill     = document.getElementById('seg-pill');
  const tabBtns  = Array.from(segmented.querySelectorAll('.tab-btn[role="tab"]'));
  const dots     = Array.from(document.querySelectorAll('.seg-dots .dot'));

  const panels = {
    overview: document.getElementById('panel-overview'),
    support : document.getElementById('panel-support'),
    fees    : document.getElementById('panel-fees'),
    pbx     : document.getElementById('panel-pbx'),
    compat  : document.getElementById('panel-compat'),
    legal   : document.getElementById('panel-legal')
  };

  function showPanel(key){
    Object.entries(panels).forEach(([k, el])=>{
      if (!el) return;
      const isActive = (k === key);
      el.classList.toggle('hidden', !isActive);
      el.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function movePillTo(tab){
    if (!pill || !tab || !segInner) return;
    const tabRect = tab.getBoundingClientRect();
    const innerRect = segInner.getBoundingClientRect();
    const left = (tabRect.left - innerRect.left) + segInner.scrollLeft;
    pill.style.transform = `translateX(${left}px)`;
    pill.style.width = `${tabRect.width}px`;
  }

  function setActive(tabKey){
    tabBtns.forEach(btn=>{
      const isActive = btn.dataset.tab === tabKey;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) movePillTo(btn);
    });

    dots.forEach(d=> d.classList.toggle('is-active', d.dataset.tab === tabKey));
    showPanel(tabKey);

    const activeBtn = tabBtns.find(b => b.dataset.tab === tabKey);
    activeBtn?.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' });

    try { history.replaceState(null, '', `#${tabKey}`); } catch {}
  }

  function updateFades(){
    const leftFade  = segmented.querySelector('.segmented-fade.left');
    const rightFade = segmented.querySelector('.segmented-fade.right');
    if (!leftFade || !rightFade) return;
    const max = segInner.scrollWidth - segInner.clientWidth;
    const x = segInner.scrollLeft;
    leftFade.style.opacity  = x > 2 ? '1' : '0';
    rightFade.style.opacity = (max - x) > 2 ? '1' : '0';
  }

  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setActive(btn.dataset.tab);
      btn.focus();
    });
  });

  dots.forEach(dot=>{
    dot.addEventListener('click', ()=>{
      setActive(dot.dataset.tab);
      const match = tabBtns.find(b=>b.dataset.tab===dot.dataset.tab);
      match?.focus();
    });
  });

  segmented.addEventListener('keydown', (e)=>{
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = tabBtns.findIndex(b => b.getAttribute('aria-selected') === 'true');
    if (idx < 0) return;
    const next = e.key === 'ArrowRight'
      ? Math.min(idx + 1, tabBtns.length - 1)
      : Math.max(idx - 1, 0);
    setActive(tabBtns[next].dataset.tab);
    tabBtns[next].focus();
  });

  window.addEventListener('resize', ()=>{
    const active = tabBtns.find(b => b.getAttribute('aria-selected') === 'true') || tabBtns[0];
    movePillTo(active);
    updateFades();
  }, { passive: true });

  segInner?.addEventListener('scroll', updateFades, { passive: true });

  const hashKey = (location.hash || '').replace('#','');
  const initialKey = tabBtns.some(b => b.dataset.tab === hashKey) ? hashKey : 'overview';

  requestAnimationFrame(()=>{
    setActive(initialKey);
    updateFades();
  });
})();

// ------- Micro parallax (disabled for reduced motion) -------
(() => {
  const heroImg = document.querySelector('.hero-v4[data-parallax="on"] .hero-img');
  if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const offset = Math.max(-18, Math.min(18, y * 0.06));
      heroImg.style.transform = `scale(1.02) translateY(${offset}px)`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ------- Footer year -------
(() => {
  const y = document.getElementById('y');
  if (y) y.textContent = String(new Date().getFullYear());
})();
