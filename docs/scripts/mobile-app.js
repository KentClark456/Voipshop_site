/* mobile-app.js — Professional Number (App) page
   - Calculator & persistence (R65 x apps now; R25 added in Step 2)
   - Segmented tabs logic
*/
(() => {
  'use strict';

  // ---------- Calculator + Persistence ----------
  const NUMBER_MONTHLY   = 25; // added in Step 2 only
  const PER_APP_MONTHLY  = 65; // per app per month
  const ONCE_OFF_FREE    = 0;  // setup free

  const appsInput  = document.getElementById('pn-apps');
  const decBtn     = document.getElementById('app-dec');
  const incBtn     = document.getElementById('app-inc');
  const onceOffEl  = document.getElementById('pn-total-onceoff');
  const monthlyEl  = document.getElementById('pn-total-monthly');
  const numberBtn  = document.getElementById('pn-choose-number-btn');

  const R = (num) => 'R ' + Number(num || 0).toLocaleString('en-ZA');

  function clampApps(n){
    const x = parseInt(n, 10);
    return Number.isFinite(x) && x > 0 ? x : 1;
  }

  function startFreshOrder(){
    try {
      localStorage.removeItem('voip:selectedPackage');
      localStorage.removeItem('voip:customBuild');
      localStorage.removeItem('voip:virtualNumber');
    } catch {}
  }

  function persistForNextSteps(apps, monthlyNow, onceoff){
    startFreshOrder();

    const payload = {
      label: `Professional Number (App) — ${apps} app${apps>1?'s':''}`,
      name:  'Professional Number (App)',
      monthly: monthlyNow,   // R65 x apps (number added next step)
      onceOff: onceoff,      // 0
      extensions: apps,      // reuse checkout counter as "apps"
      isAppOnly: true,
      isVoiceOnly: false,
      isNewGeoNumber: true,
      tags: ['app-only','new-number'],
      devices: [],
      minutesIncluded: null,
      meta: { mode:'app', apps, numberMonthly: NUMBER_MONTHLY }
    };

    try { localStorage.setItem('voip:selectedPackage', JSON.stringify(payload)); } catch {}
    try { localStorage.setItem('voip:customBuild', JSON.stringify([])); } catch {}
  }

  function updateNumberLink(apps, monthlyNow, onceoff){
    const params = new URLSearchParams({
      mode: 'new',           // choose new geographic number
      product: 'app',
      apps: String(apps),
      monthly: String(monthlyNow), // only R65 x apps for now
      onceoff: String(onceoff)
    });
    if (numberBtn) numberBtn.href = 'virtual-number.html?' + params.toString();
  }

  function recalc(){
    const apps = clampApps(appsInput?.value ?? 1);
    const monthlyNow = PER_APP_MONTHLY * apps; // R65 x apps
    const onceoff = ONCE_OFF_FREE;

    if (monthlyEl) monthlyEl.textContent = R(monthlyNow);
    if (onceOffEl)  onceOffEl.textContent  = R(onceoff);

    persistForNextSteps(apps, monthlyNow, onceoff);
    updateNumberLink(apps, monthlyNow, onceoff);
  }

  // Wire up stepper
  decBtn?.addEventListener('click', () => {
    if (!appsInput) return;
    appsInput.value = Math.max(1, clampApps(appsInput.value) - 1);
    recalc(); appsInput.focus();
  });
  incBtn?.addEventListener('click', () => {
    if (!appsInput) return;
    appsInput.value = clampApps(appsInput.value) + 1;
    recalc(); appsInput.focus();
  });
  appsInput?.addEventListener('input', () => {
    // ensure only digits while typing
    appsInput.value = (appsInput.value || '').replace(/[^0-9]/g,'');
    recalc();
  });

  // Initial paint + footer year
  recalc();
  try { document.getElementById('y').textContent = new Date().getFullYear(); } catch {}

  // ---------- Segmented Tabs Logic ----------
  const segmented   = document.getElementById('segmented');
  if (!segmented) return;

  const segInner    = segmented.querySelector('.seg-inner');
  const pill        = document.getElementById('seg-pill');
  const tabBtns     = Array.from(segmented.querySelectorAll('.tab-btn[role="tab"]'));
  const dots        = Array.from(document.querySelectorAll('.seg-dots .dot'));

  const panels = {
    overview:  document.getElementById('panel-overview'),
    support:   document.getElementById('panel-support'),
    fees:      document.getElementById('panel-fees'),
    features:  document.getElementById('panel-features'),
    legal:     document.getElementById('panel-legal')
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
    const left = (tabRect.left - innerRect.left) + segInner.scrollLeft; // account for scroll
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
    if (activeBtn) activeBtn.scrollIntoView({ inline:'center', block:'nearest', behavior:'smooth' });
    history.replaceState(null, '', `#${tabKey}`);
  }

  function updateFades(){
    const leftFade  = segmented.querySelector('.segmented-fade.left');
    const rightFade = segmented.querySelector('.segmented-fade.right');
    if (!leftFade || !rightFade || !segInner) return;
    const max = segInner.scrollWidth - segInner.clientWidth;
    const x = segInner.scrollLeft;
    leftFade.style.opacity  = x > 2 ? '1' : '0';
    rightFade.style.opacity = (max - x) > 2 ? '1' : '0';
  }

  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{ setActive(btn.dataset.tab); btn.focus(); });
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
    movePillTo(active); updateFades();
  });
  segInner?.addEventListener('scroll', updateFades, { passive: true });

  const hashKey = (location.hash || '').replace('#','');
  const initialKey = tabBtns.some(b => b.dataset.tab === hashKey) ? hashKey : 'overview';
  requestAnimationFrame(()=>{ setActive(initialKey); updateFades(); });
})();
