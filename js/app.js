const FRICTION = 0.991, DRIFT_FORCE = 0.002, MAX_SPEED = 2.5;
const MOUSE_RADIUS = 120, PUSH_THRESHOLD = 8, ATTRACT_THRESHOLD = 2, PUSH_FORCE_MAX = 0.3, ATTRACT_FORCE = 0.002;
const EDGE_MARGIN = 160, EDGE_PAD = 18, BOTTOM_PAD = 130, CENTER_GRAVITY = 0.0006;
const EDGE_PUSH_SOFT = 0.003, EDGE_PUSH_BOTTOM = 0.025, BOUNCE_DAMPING = 0.2;
const REPULSE_FORCE = 0.045, REPULSE_BUFFER = 40, REPULSE_HARD_THRESHOLD = 0.85, REPULSE_HARD_PUSH = 0.12;
const NAV_CONFIG = { friction: FRICTION, drift: DRIFT_FORCE, maxSpeed: MAX_SPEED, centerY: 0.42 };
const DEFAULT_PAGE = 'sobre';
// Only pages present in the HTML are routable, so a deploy where the HTML and JS briefly disagree can't crash.
const pages = Object.fromEntries(Object.entries({ sobre: 'page-sobre', selos: 'page-selos', acervo: 'page-acervo', record: 'page-record' })
  .map(([k, id]) => [k, document.getElementById(id)]).filter(([, el]) => el));
const navWords = document.querySelectorAll('.nav-word');
const floatNav = document.getElementById('float-nav'), navPulldownEl = document.getElementById('nav-pulldown');
const photoTabsEl = document.getElementById('photo-tabs'), scrollArrow = document.getElementById('scroll-arrow');
let mouseX = -9999, mouseY = -9999, mouseSpeed = 0, mouseActive = false, mouseIdleTimer = null;
document.addEventListener('mousemove', e => {
  const dx = e.clientX - mouseX, dy = e.clientY - mouseY;
  mouseX = e.clientX; mouseY = e.clientY;
  mouseSpeed = mouseSpeed * 0.65 + Math.sqrt(dx * dx + dy * dy) * 0.35;
  mouseActive = true; clearTimeout(mouseIdleTimer);
  mouseIdleTimer = setTimeout(() => { mouseActive = false; }, 5000);
  wakeLoop();
});
document.addEventListener('touchmove', e => { const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseSpeed = 0; wakeLoop(); }, { passive: true });
document.addEventListener('touchend', () => { mouseX = -9999; mouseY = -9999; mouseSpeed = 0; });
function tickEntity(ent, cfg) {
  const VW = window.innerWidth, VH = window.innerHeight;
  const cx = ent.x + ent.w * 0.5, cy = ent.y + ent.h * 0.5;
  const ddx = mouseX - cx, ddy = mouseY - cy, dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
  if (mouseActive && dist < MOUSE_RADIUS) {
    if (mouseSpeed > PUSH_THRESHOLD) {
      const pf = Math.min(mouseSpeed * 0.004, PUSH_FORCE_MAX);
      ent.vx -= (ddx / dist) * pf; ent.vy -= (ddy / dist) * pf;
    } else if (mouseSpeed < ATTRACT_THRESHOLD) {
      ent.vx += (ddx / dist) * ATTRACT_FORCE; ent.vy += (ddy / dist) * ATTRACT_FORCE;
    }
  }
  ent._driftAngle += ent._driftAngleSpeed;
  if (Math.random() < 0.0005) {
    ent._driftAngleSpeed += (Math.random() - 0.5) * 0.0002;
    ent._driftAngleSpeed = Math.max(-0.0009, Math.min(0.0009, ent._driftAngleSpeed));
  }
  ent.vx += Math.cos(ent._driftAngle) * cfg.drift;
  ent.vy += Math.sin(ent._driftAngle) * cfg.drift;
  const gcx = VW * 0.5 - cx, gcy = VH * (cfg.centerY || 0.42) - cy;
  const gd = Math.sqrt(gcx * gcx + gcy * gcy) || 1;
  ent.vx += (gcx / gd) * CENTER_GRAVITY; ent.vy += (gcy / gd) * CENTER_GRAVITY;
  const spd = Math.sqrt(ent.vx * ent.vx + ent.vy * ent.vy);
  if (spd > cfg.maxSpeed) { const r = cfg.maxSpeed / spd; ent.vx *= r; ent.vy *= r; }
  ent.vx *= cfg.friction; ent.vy *= cfg.friction;
  ent.x += ent.vx; ent.y += ent.vy;
  if (ent.x < EDGE_MARGIN) ent.vx += EDGE_PUSH_SOFT * (EDGE_MARGIN - ent.x) / EDGE_MARGIN;
  if (ent.x + ent.w > VW - EDGE_MARGIN) ent.vx -= EDGE_PUSH_SOFT * (ent.x + ent.w - (VW - EDGE_MARGIN)) / EDGE_MARGIN;
  if (ent.y < EDGE_MARGIN) ent.vy += EDGE_PUSH_SOFT * (EDGE_MARGIN - ent.y) / EDGE_MARGIN;
  if (ent.y + ent.h > VH - EDGE_MARGIN) ent.vy -= EDGE_PUSH_BOTTOM * (ent.y + ent.h - (VH - EDGE_MARGIN)) / EDGE_MARGIN;
  if (ent.x < EDGE_PAD) { ent.x = EDGE_PAD; ent.vx = Math.abs(ent.vx) * BOUNCE_DAMPING; ent._driftAngle = Math.PI - ent._driftAngle; }
  if (ent.x + ent.w > VW - EDGE_PAD) { ent.x = VW - ent.w - EDGE_PAD; ent.vx = -Math.abs(ent.vx) * BOUNCE_DAMPING; ent._driftAngle = Math.PI - ent._driftAngle; }
  if (ent.y < EDGE_PAD) { ent.y = EDGE_PAD; ent.vy = Math.abs(ent.vy) * BOUNCE_DAMPING; ent._driftAngle = -ent._driftAngle; }
  if (ent.y + ent.h > VH - BOTTOM_PAD) { ent.y = VH - ent.h - BOTTOM_PAD; ent.vy = -Math.abs(ent.vy) * BOUNCE_DAMPING; ent._driftAngle = -ent._driftAngle; }
  ent.el.style.transform = `translate3d(${ent.x}px,${ent.y}px,0)`;
}
class FloatingWord {
  constructor(el, x, y, angle) {
    this.el = el; this.x = x; this.y = y; this.w = 0; this.h = 0;
    this._driftAngle = angle;
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0005);
    this.vx = Math.cos(angle) * 2.0; this.vy = Math.sin(angle) * 2.0;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
  }
  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }
  tick() { tickEntity(this, NAV_CONFIG); }
}
const floatingWords = (() => {
  const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.5;
  const base = Math.random() * Math.PI * 2, n = navWords.length;
  return Array.from(navWords).map((el, i) =>
    new FloatingWord(el, cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 15, base + (i / n) * Math.PI * 2)
  );
})();
// Gabriel's negative look on the home page: where a floating word crosses the logo's ink it turns white.
// White copies of the words live inside the brand's .brand-neg layer (already masked by the logo) and
// follow the words; each copy takes the word's own alpha, so faded words stay faint.
const brandEl = document.getElementById('site-brand'), brandNeg = brandEl && brandEl.querySelector('.brand-neg');
const wordNegs = brandNeg ? floatingWords.map(fw => {
  const s = document.createElement('span');
  s.className = 'nav-neg'; s.textContent = fw.el.textContent; s.hidden = true;
  brandNeg.appendChild(s); return s;
}) : [];
let brandRect = null;
function measureWordNegs() {
  if (!brandNeg) return;
  brandRect = brandEl.getBoundingClientRect();
  floatingWords.forEach((fw, i) => { wordNegs[i].style.fontSize = getComputedStyle(fw.el).fontSize; });
}
function wordAlpha(el) {   // colour alpha x opacity, e.g. rgba(15, 15, 15, 0.22) at opacity 1 -> 0.22
  const cs = getComputedStyle(el), m = cs.color.match(/rgba?\(([^)]+)\)/), parts = m ? m[1].split(',') : [];
  return (parts.length === 4 ? parseFloat(parts[3]) : 1) * parseFloat(cs.opacity);
}
function updateWordNegs() {
  if (!brandRect) return;
  const b = brandRect;
  floatingWords.forEach((fw, i) => {
    const n = wordNegs[i];
    const over = fw.x < b.right && fw.x + fw.w > b.left && fw.y < b.bottom && fw.y + fw.h > b.top;
    const a = over ? wordAlpha(fw.el) : 0;
    if (a < 0.01) { if (!n.hidden) n.hidden = true; return; }
    n.hidden = false;
    n.style.opacity = a.toFixed(3);
    n.style.transform = `translate3d(${fw.x - b.left}px,${fw.y - b.top}px,0)`;
  });
}
const measureAll = () => { floatingWords.forEach(fw => fw.measure()); measureWordNegs(); };
document.fonts.ready.then(measureAll);
window.addEventListener('resize', measureAll);
let loopRunning = false, idleFrames = 0;
const extraTicks = [];
function registerTick(fn) { if (!extraTicks.includes(fn)) extraTicks.push(fn); }
function unregisterTick(fn) { const i = extraTicks.indexOf(fn); if (i >= 0) extraTicks.splice(i, 1); }
function wakeLoop() { idleFrames = 0; if (!loopRunning) { loopRunning = true; requestAnimationFrame(loop); } }
function loop(now) {
  if (document.hidden) { loopRunning = false; return; }
  floatingWords.forEach(fw => fw.tick());
  for (let i = 0; i < floatingWords.length; i++) {
    for (let j = i + 1; j < floatingWords.length; j++) {
      const a = floatingWords[i], b = floatingWords[j];
      const dx = (b.x + b.w * 0.5) - (a.x + a.w * 0.5), dy = (b.y + b.h * 0.5) - (a.y + a.h * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1, minDist = (a.w + b.w) * 0.5 + REPULSE_BUFFER;
      if (dist < minDist) {
        const nx = dx / dist, ny = dy / dist, f = REPULSE_FORCE * (1 - dist / minDist);
        a.vx -= nx * f; a.vy -= ny * f; b.vx += nx * f; b.vy += ny * f;
        if (dist < minDist * REPULSE_HARD_THRESHOLD) {
          const push = (minDist * REPULSE_HARD_THRESHOLD - dist) * REPULSE_HARD_PUSH;
          a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }
  updateWordNegs();
  extraTicks.forEach(fn => fn(now));
  if (!mouseActive) {
    let maxVSq = 0;
    for (const fw of floatingWords) { const v = fw.vx * fw.vx + fw.vy * fw.vy; if (v > maxVSq) maxVSq = v; }
    if (maxVSq < 0.002) idleFrames++; else idleFrames = 0;
  } else idleFrames = 0;
  if (idleFrames > 120) { loopRunning = false; return; }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) wakeLoop(); });
wakeLoop();
let currentKey = null, currentParam = null;
// Scroll hint: visible near the top of any page that has more below; fades out as soon as you scroll.
function updateScrollHint() {
  if (!scrollArrow) return;
  const more = document.documentElement.scrollHeight - window.innerHeight > 80;
  scrollArrow.classList.toggle('visible', more && window.scrollY <= 40);
}
// Addresses: / (Sobre), #selos, #acervo, and #acervo/<record id> for a record page (page key 'record').
// Anything else opens Sobre.
const urlFor = (key, param) => key === DEFAULT_PAGE ? location.pathname + location.search
  : key === 'record' ? '#acervo/' + param : '#' + key;
function parseHash() {
  const [k, ...rest] = location.hash.replace('#', '').split('/');
  const param = rest.join('/') || null;
  const key = k === 'acervo' && param ? 'record' : k === 'record' ? null : k;   // 'record' is internal only
  const valid = Object.hasOwn(pages, key) && (key === 'record' ? !!param : !param);
  return valid ? { key, param } : { key: DEFAULT_PAGE, param: null };
}
// history: 'push' for user navigation, 'replace' for first load, 'none' when responding to Back/Forward
function showPage(key, historyMode = 'push', param = null) {
  if (!Object.hasOwn(pages, key)) return;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  navWords.forEach(w => { const on = w.dataset.page === key; w.classList.toggle('active', on); w.classList.toggle('inactive', !on); });
  if (historyMode === 'replace') history.replaceState(null, '', urlFor(key, param));
  else if (historyMode === 'push' && (key !== currentKey || param !== currentParam)) history.pushState(null, '', urlFor(key, param));
  currentKey = key; currentParam = param;
  if (key !== 'record') document.title = 'MusicaNossa';
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const isPhoto = key === 'acervo', isAlbum = key === 'record';
  floatNav.classList.toggle('photo-active', isPhoto); floatNav.classList.toggle('album-active', isAlbum);
  navPulldownEl.classList.toggle('visible', isPhoto || isAlbum);
  if (photoTabsEl) photoTabsEl.classList.toggle('visible', isPhoto);
  if (typeof window.initPhotoFloat === 'function' && typeof window.destroyPhotoFloat === 'function') {
    if (isPhoto) window.initPhotoFloat(); else window.destroyPhotoFloat();
  }
  if (isAlbum && typeof window.renderAlbum === 'function') window.renderAlbum(param);
  updateScrollHint(); setTimeout(updateScrollHint, 400); // again once covers/images have laid out
  wakeLoop();
}
navWords.forEach(w => {
  w.addEventListener('click', () => showPage(w.dataset.page));
  w.addEventListener('mouseenter', () => w.classList.remove('inactive'));
  w.addEventListener('mouseleave', () => { if (!w.classList.contains('active')) w.classList.add('inactive'); });
});
window.addEventListener('popstate', () => { const { key, param } = parseHash(); showPage(key, 'none', param); });
// Skip link: focus the active page's content instead of changing the hash (which would trigger routing).
const skipLink = document.querySelector('.skip-link');
if (skipLink) skipLink.addEventListener('click', e => {
  e.preventDefault();
  const main = document.querySelector('.page.active .page-body');
  if (main) { main.setAttribute('tabindex', '-1'); main.focus(); main.scrollIntoView(); }
});
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > window.innerHeight * 0.15;
  document.body.classList.toggle('scrolled', scrolled);
  updateScrollHint();
  if (navPulldownEl && !['photo-active', 'album-active'].some(c => floatNav.classList.contains(c)))
    navPulldownEl.classList.toggle('visible', scrolled);
}, { passive: true });
if (scrollArrow) {
  scrollArrow.addEventListener('click', e => { e.stopPropagation(); window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' }); });
  window.addEventListener('resize', updateScrollHint);
  window.addEventListener('load', updateScrollHint);
}
const pulldownToggle = document.getElementById('pulldown-toggle'), pulldownMenu = document.getElementById('pulldown-menu');
if (pulldownToggle) pulldownToggle.addEventListener('click', e => {
  e.stopPropagation(); pulldownMenu.classList.toggle('open');
  pulldownToggle.setAttribute('aria-expanded', pulldownMenu.classList.contains('open'));
});
if (pulldownMenu) pulldownMenu.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => { pulldownMenu.classList.remove('open'); pulldownToggle.setAttribute('aria-expanded', 'false'); showPage(btn.dataset.page); });
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (typeof window.floatingImages !== 'undefined') window.floatingImages.forEach(fi => { if (fi._enlarged) fi.toggleEnlarge(); });
});
document.querySelectorAll('#site-brand, .hero-name, .hero-tagline').forEach(el => el.addEventListener('click', () => showPage(DEFAULT_PAGE)));
document.addEventListener('click', () => {
  if (typeof window.floatingImages !== 'undefined') window.floatingImages.forEach(fi => { if (fi._enlarged) fi.toggleEnlarge(); });
  if (pulldownMenu) pulldownMenu.classList.remove('open');
  if (pulldownToggle) pulldownToggle.setAttribute('aria-expanded', 'false');
});
{ const { key, param } = parseHash(); showPage(key, 'replace', param); }
// Shared with photo.js (record archive): physics, routing and the animation loop.
window.App = { tickEntity, showPage, wakeLoop, registerTick, unregisterTick };
