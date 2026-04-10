const FRICTION = 0.991, DRIFT_FORCE = 0.002, MAX_SPEED = 2.5;
const MOUSE_RADIUS = 120, PUSH_THRESHOLD = 8, ATTRACT_THRESHOLD = 2;
const PUSH_FORCE_MAX = 0.3, ATTRACT_FORCE = 0.002;
const EDGE_MARGIN = 160, EDGE_PAD = 18, BOTTOM_PAD = 130;
const CENTER_GRAVITY = 0.0006, EDGE_PUSH_SOFT = 0.003, EDGE_PUSH_BOTTOM = 0.025;
const BOUNCE_DAMPING = 0.2, IDLE_TIMEOUT = 5000;
const REPULSE_FORCE = 0.045, REPULSE_BUFFER = 40;
const REPULSE_HARD_THRESHOLD = 0.85, REPULSE_HARD_PUSH = 0.12;
const IDLE_FRAMES_LIMIT = 120;

const pages = { cv: document.getElementById('page-cv'), film: document.getElementById('page-film'), music: document.getElementById('page-music'), 'film-photo': document.getElementById('page-film-photo') };
const navWords = document.querySelectorAll('.nav-word');
const floatNav = document.getElementById('float-nav');
const navPulldownEl = document.getElementById('nav-pulldown');
const photoTabsEl = document.getElementById('photo-tabs');
const scrollArrow = document.getElementById('scroll-arrow');
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const recordEl = document.getElementById('record');

let mouseX = -9999, mouseY = -9999, mouseSpeed = 0;
let mouseActive = false, mouseIdleTimer = null;
document.addEventListener('mousemove', e => {
  const dx = e.clientX - mouseX, dy = e.clientY - mouseY;
  mouseX = e.clientX; mouseY = e.clientY;
  mouseSpeed = mouseSpeed * 0.65 + Math.sqrt(dx * dx + dy * dy) * 0.35;
  mouseActive = true;
  clearTimeout(mouseIdleTimer);
  mouseIdleTimer = setTimeout(() => { mouseActive = false; }, IDLE_TIMEOUT);
  wakeLoop();
});
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX; mouseY = t.clientY; mouseSpeed = 0;
  wakeLoop();
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = -9999; mouseY = -9999; mouseSpeed = 0; });

function tickEntity(ent, cfg) {
  const VW = window.innerWidth, VH = window.innerHeight;
  const cx = ent.x + ent.w * 0.5, cy = ent.y + ent.h * 0.5;
  const ddx = mouseX - cx, ddy = mouseY - cy;
  const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
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
const NAV_CONFIG = { friction: FRICTION, drift: DRIFT_FORCE, maxSpeed: MAX_SPEED, centerY: 0.42 };

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
document.fonts.ready.then(() => { floatingWords.forEach(fw => fw.measure()); });
window.addEventListener('resize', () => { floatingWords.forEach(fw => fw.measure()); });

let recordVisible = false;
function updateRecordVisibility(key) {
  recordVisible = (key === 'music');
  recordEl.classList.toggle('visible', recordVisible);
}

const extraTicks = [];
let loopRunning = false, idleFrames = 0;
function registerTick(fn) { if (!extraTicks.includes(fn)) extraTicks.push(fn); }
function unregisterTick(fn) { const i = extraTicks.indexOf(fn); if (i >= 0) extraTicks.splice(i, 1); }
function wakeLoop() {
  idleFrames = 0;
  if (!loopRunning) { loopRunning = true; requestAnimationFrame(loop); }
}

function loop(now) {
  if (document.hidden) { loopRunning = false; return; }
  floatingWords.forEach(fw => fw.tick());
  for (let i = 0; i < floatingWords.length; i++) {
    for (let j = i + 1; j < floatingWords.length; j++) {
      const a = floatingWords[i], b = floatingWords[j];
      const dx = (b.x + b.w * 0.5) - (a.x + a.w * 0.5);
      const dy = (b.y + b.h * 0.5) - (a.y + a.h * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const minDist = (a.w + b.w) * 0.5 + REPULSE_BUFFER;
      if (dist < minDist) {
        const nx = dx / dist, ny = dy / dist;
        const f = REPULSE_FORCE * (1 - dist / minDist);
        a.vx -= nx * f; a.vy -= ny * f;
        b.vx += nx * f; b.vy += ny * f;
        if (dist < minDist * REPULSE_HARD_THRESHOLD) {
          const push = (minDist * REPULSE_HARD_THRESHOLD - dist) * REPULSE_HARD_PUSH;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }
  extraTicks.forEach(fn => fn(now));
  if (!mouseActive) {
    let maxVSq = 0;
    for (const fw of floatingWords) {
      const v = fw.vx * fw.vx + fw.vy * fw.vy;
      if (v > maxVSq) maxVSq = v;
    }
    if (maxVSq < 0.002) idleFrames++; else idleFrames = 0;
  } else { idleFrames = 0; }
  if (idleFrames > IDLE_FRAMES_LIMIT) { loopRunning = false; return; }
  requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) wakeLoop(); });
wakeLoop();

function checkCineAuth() { return sessionStorage.getItem('cine_auth') === '1'; }
function showCineLogin(onSuccess) {
  const existing = document.getElementById('cine-login-overlay');
  if (existing) existing.remove();
  const overlay = document.getElementById('cine-auth-template').cloneNode(true);
  overlay.id = 'cine-login-overlay'; overlay.style.display = '';
  document.body.appendChild(overlay);
  const userEl = overlay.querySelector('.cine-user');
  const passEl = overlay.querySelector('.cine-pass');
  const errEl = overlay.querySelector('.cine-error');
  function tryLogin() {
    if (userEl.value === 'admin' && passEl.value === 'bogota') {
      sessionStorage.setItem('cine_auth', '1'); overlay.remove(); onSuccess();
    } else {
      errEl.textContent = 'Invalid credentials.'; errEl.style.opacity = '1';
      passEl.value = ''; passEl.focus();
    }
  }
  overlay.querySelector('.cine-submit').addEventListener('click', tryLogin);
  passEl.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  userEl.addEventListener('keydown', e => { if (e.key === 'Enter') passEl.focus(); });
  userEl.focus();
}

let bobInterval = null;
function showPage(key) {
  if (!pages[key]) return;
  if (key === 'film' && !checkCineAuth()) { showCineLogin(() => showPage('film')); return; }
  closeLightbox();
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  navWords.forEach(w => {
    const on = w.dataset.page === key;
    w.classList.toggle('active', on);
    w.classList.toggle('inactive', !on);
  });
  updateRecordVisibility(key);
  history.pushState(null, '', key === 'cv' ? window.location.pathname : '#' + key);
  window.scrollTo(0, 0);
  const isPhoto = key === 'film-photo', isMusic = key === 'music';
  floatNav.classList.toggle('photo-active', isPhoto);
  floatNav.classList.toggle('music-active', isMusic);
  navPulldownEl.classList.toggle('visible', isPhoto || isMusic);
  photoTabsEl.classList.toggle('visible', isPhoto);
  if (typeof window.initPhotoFloat === 'function' && typeof window.destroyPhotoFloat === 'function') {
    if (isPhoto) window.initPhotoFloat(); else window.destroyPhotoFloat();
  }
  if (scrollArrow) scrollArrow.style.display = isPhoto ? 'none' : '';
  if (isMusic && typeof window.initSC === 'function') window.initSC();
  wakeLoop();
}

navWords.forEach(w => {
  w.addEventListener('click', () => showPage(w.dataset.page));
  w.addEventListener('mouseenter', () => w.classList.remove('inactive'));
  w.addEventListener('mouseleave', () => { if (!w.classList.contains('active')) w.classList.add('inactive'); });
});
window.addEventListener('popstate', () => {
  const h = location.hash.replace('#', '');
  showPage(pages[h] ? h : 'cv');
});

document.querySelectorAll('.film-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.film-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.film-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('film-tab-' + tab.dataset.filmTab);
    if (target) target.classList.add('active');
  });
});

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > window.innerHeight * 0.15;
  floatNav.classList.toggle('scrolled', scrolled);
  if (scrollArrow) {
    if (window.scrollY > 40) scrollArrow.classList.remove('visible');
    else scrollArrow.classList.add('visible');
  }
  if (navPulldownEl && !floatNav.classList.contains('photo-active') && !floatNav.classList.contains('music-active')) {
    navPulldownEl.classList.toggle('visible', scrolled);
  }
}, { passive: true });

if (scrollArrow) {
  scrollArrow.classList.add('visible');
  scrollArrow.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  });
  bobInterval = setInterval(() => {
    if (!scrollArrow.classList.contains('visible')) { clearInterval(bobInterval); bobInterval = null; return; }
    scrollArrow.classList.remove('bobbing'); void scrollArrow.offsetWidth; scrollArrow.classList.add('bobbing');
  }, 300000);
}

const pulldownToggle = document.getElementById('pulldown-toggle');
const pulldownMenu = document.getElementById('pulldown-menu');
if (pulldownToggle) {
  pulldownToggle.addEventListener('click', e => {
    e.stopPropagation();
    pulldownMenu.classList.toggle('open');
    pulldownToggle.setAttribute('aria-expanded', pulldownMenu.classList.contains('open'));
  });
}
if (pulldownMenu) {
  pulldownMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      pulldownMenu.classList.remove('open');
      pulldownToggle.setAttribute('aria-expanded', 'false');
      showPage(btn.dataset.page);
    });
  });
}

function openLightbox(src) { lbImg.src = src; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLightbox() { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }
document.getElementById('lb-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
['film-grid', 'bts-grid'].forEach(id => {
  const g = document.getElementById(id);
  if (g) g.addEventListener('click', e => { const img = e.target.closest('img'); if (img) openLightbox(img.src); });
});

document.querySelectorAll('.hero-name, .hero-tagline').forEach(el => {
  el.addEventListener('click', () => showPage('cv'));
});

const contactOverlay = document.querySelector('.contact-overlay');
if (contactOverlay) {
  function openContact() { contactOverlay.classList.add('open'); }
  function closeContact() {
    contactOverlay.classList.remove('open');
    const f = document.getElementById('contact-form');
    if (f) { f.reset(); const s = f.querySelector('.contact-sent'); if (s) s.remove(); f.style.display = ''; }
  }
  contactOverlay.querySelector('.contact-close').addEventListener('click', closeContact);
  contactOverlay.addEventListener('click', e => { if (e.target === contactOverlay) closeContact(); });
  document.querySelectorAll('.censored').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openContact(); });
  });
  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this, btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ subject: form.subject.value, message: form.message.value })
    }).then(r => r.json()).then(() => {
      form.style.display = 'none';
      const msg = document.createElement('div'); msg.className = 'contact-sent'; msg.textContent = 'Message sent. Thank you.';
      form.parentNode.appendChild(msg);
      setTimeout(closeContact, 2000);
    }).catch(() => { btn.textContent = 'Send'; btn.disabled = false; alert('Could not send. Please try again.'); });
  });
}

document.addEventListener('click', () => {
  if (typeof window.floatingImages !== 'undefined') {
    window.floatingImages.forEach(fi => { if (fi._enlarged) fi.toggleEnlarge(); });
  }
  document.querySelectorAll('.photo-tab').forEach(t => t.classList.remove('dropdown-open'));
  document.querySelectorAll('.photo-dropdown').forEach(d => d.classList.remove('open'));
  if (pulldownMenu) pulldownMenu.classList.remove('open');
  if (pulldownToggle) pulldownToggle.setAttribute('aria-expanded', 'false');
});

const _h = location.hash.replace('#', '');
showPage(pages[_h] ? _h : 'cv');

window.App = {
  mouseX: () => mouseX, mouseY: () => mouseY,
  mouseSpeed: () => mouseSpeed, mouseActive: () => mouseActive,
  tickEntity, NAV_CONFIG, showPage, wakeLoop,
  registerTick, unregisterTick,
  get recordVisible() { return recordVisible; },
  set recordVisible(v) { recordVisible = v; },
  floatingWords, recordEl
};
