// =============================================
// Gabriel Abdo Alcântara — Portfolio
// =============================================

const pages = {
  cv:    document.getElementById('page-cv'),
  film:  document.getElementById('page-film'),
  music: document.getElementById('page-music'),
};
const navWords = document.querySelectorAll('.nav-word');

function showPage(key) {
  if (!pages[key]) return;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  navWords.forEach(w => {
    const active = w.dataset.page === key;
    w.classList.toggle('active', active);
    w.classList.toggle('inactive', !active);
  });
  updateRecordVisibility(key);
  history.pushState(null, '', key === 'cv' ? '/' : '#' + key);
  window.scrollTo(0, 0);
}

function loadFromHash() {
  const hash = location.hash.replace('#', '');
  showPage(pages[hash] ? hash : 'cv');
}

navWords.forEach(w => {
  w.addEventListener('click', () => showPage(w.dataset.page));
  w.addEventListener('mouseenter', () => w.classList.remove('inactive'));
});
window.addEventListener('popstate', loadFromHash);

// ── MOUSE ──────────────────────────────────────
let mouseX = -9999, mouseY = -9999, mouseSpeed = 0;

document.addEventListener('mousemove', e => {
  const dx = e.clientX - mouseX, dy = e.clientY - mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseSpeed = mouseSpeed * 0.7 + Math.sqrt(dx * dx + dy * dy) * 0.3;
});
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX; mouseY = t.clientY; mouseSpeed = 0;
}, { passive: true });
document.addEventListener('touchend', () => {
  mouseX = -9999; mouseY = -9999; mouseSpeed = 0;
});

// ── FLOATING PHYSICS ─────────────────────────────
// Lazy, drifty movement — everything feels weightless and unhurried.
const DRIFT_SPEED   = 0.15;   // max idle drift
const FRICTION      = 0.96;   // per-frame velocity damping (high = floaty)
const MAX_SPEED     = 1.4;    // absolute speed cap
const ATTRACT_STEP  = 0.018;  // how fast elements lerp toward slow cursor
const REPEL_FORCE   = 0.12;   // push strength on fast cursor
const ATTRACT_R     = 130;    // attraction radius
const REPEL_R       = 180;    // repulsion radius
const SLOW_THRESH   = 4;      // mouse speed below this = "slow"
const JITTER        = 0.012;  // subtle random nudge when nearly still

class FloatingWord {
  constructor(el, x, y) {
    this.el = el;
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * DRIFT_SPEED;
    this.vy = (Math.random() - 0.5) * DRIFT_SPEED;
    this.w = 0; this.h = 0;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
  }

  measure() {
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
  }

  tick(mx, my) {
    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;
    const dx = cx - mx, dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Slow cursor → gently attract
    if (mouseSpeed < SLOW_THRESH && dist < ATTRACT_R) {
      const t = (1 - mouseSpeed / SLOW_THRESH) * ATTRACT_STEP;
      this.x += (mx - cx) * t;
      this.y += (my - cy) * t;
      this.vx *= 0.88;
      this.vy *= 0.88;
    }
    // Fast cursor → softly repel
    else if (dist < REPEL_R) {
      const f = ((REPEL_R - dist) / REPEL_R) * REPEL_FORCE;
      this.vx += (dx / dist) * f;
      this.vy += (dy / dist) * f;
    }

    // Clamp speed
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > MAX_SPEED) {
      this.vx = (this.vx / spd) * MAX_SPEED;
      this.vy = (this.vy / spd) * MAX_SPEED;
    }

    // Friction + gentle jitter when nearly still
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    if (spd < 0.1) {
      this.vx += (Math.random() - 0.5) * JITTER;
      this.vy += (Math.random() - 0.5) * JITTER;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Soft bounce off viewport edges
    if (this.x < PAD)            { this.x = PAD;              this.vx =  Math.abs(this.vx) * 0.5; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y < PAD)            { this.y = PAD;              this.vy =  Math.abs(this.vy) * 0.5; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.5; }

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }
}

// ── RECORD ───────────────────────────────────────
class RecordPhysics extends FloatingWord {
  constructor(el, x, y) {
    super(el, x, y);
    this.vinylEl   = el.querySelector('.record-vinyl');
    this.angle     = 0;
    this.rpm       = 0;
    this.targetRpm = 0;
    this._playing  = false;
    this.lastTime  = null;

    el.addEventListener('mouseenter', () => { this.targetRpm = 3; });
    el.addEventListener('mouseleave', () => {
      this.targetRpm = this._playing ? 33 : 0;
    });
  }

  setPlaying(on) {
    this._playing = on;
    this.targetRpm = on ? 33 : 0;
  }

  tick(mx, my, now) {
    const dt = this.lastTime !== null ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    this.rpm   += (this.targetRpm - this.rpm) * 0.02;
    this.angle += this.rpm * 6 * dt;
    super.tick(mx, my);
    if (this.vinylEl) this.vinylEl.style.transform = `rotate(${this.angle}deg)`;
  }
}

// ── INIT ─────────────────────────────────────────
const vw = window.innerWidth, vh = window.innerHeight;
const startPos = [
  { x: vw * 0.08, y: vh * 0.10 },
  { x: vw * 0.52, y: vh * 0.44 },
  { x: vw * 0.22, y: vh * 0.68 },
];
const floatingWords = Array.from(navWords).map((el, i) =>
  new FloatingWord(el, startPos[i].x, startPos[i].y)
);

const recordEl  = document.getElementById('record');
const tonearmEl = document.getElementById('tonearm');
const record    = new RecordPhysics(recordEl, vw * 0.55, vh * 0.35);

document.fonts.ready.then(() => {
  floatingWords.forEach(fw => fw.measure());
  record.measure();
});
window.addEventListener('resize', () => {
  floatingWords.forEach(fw => fw.measure());
  record.measure();
});

// ── VISIBILITY ───────────────────────────────────
function updateRecordVisibility(key) {
  const on = key === 'music';
  recordEl.classList.toggle('visible', on);
  if (!on) {
    record.lastTime = null;
    if (scWidget && scPlaying) scWidget.pause();
  }
}

// ── SOUNDCLOUD ───────────────────────────────────
let scWidget = null, scReady = false, scPlaying = false;
const scPlayerEl  = document.getElementById('sc-player');
const scTrackName = document.getElementById('sc-track-name');
const scPlayBtn   = document.getElementById('sc-play');
const scPrevBtn   = document.getElementById('sc-prev');
const scNextBtn   = document.getElementById('sc-next');
const scIframe    = document.getElementById('sc-iframe');

function initSC() {
  if (typeof SC === 'undefined' || !scIframe) return;
  try {
    scWidget = SC.Widget(scIframe);
  } catch (e) { return; }

  scWidget.bind(SC.Widget.Events.READY, () => {
    scReady = true;
  });

  scWidget.bind(SC.Widget.Events.PLAY, () => {
    scPlaying = true;
    scPlayerEl.classList.add('visible');
    scWidget.getCurrentSound(s => {
      if (s) scTrackName.textContent = s.title;
    });
    syncPlayer();
  });

  scWidget.bind(SC.Widget.Events.PAUSE, () => {
    scPlaying = false;
    syncPlayer();
  });

  scWidget.bind(SC.Widget.Events.FINISH, () => {
    scPlaying = false;
    syncPlayer();
    // Auto-advance to next track
    if (scWidget) scWidget.next();
  });
}

// SC api.js may still be loading; retry until available
if (typeof SC !== 'undefined') {
  initSC();
} else {
  const poll = setInterval(() => {
    if (typeof SC !== 'undefined') { clearInterval(poll); initSC(); }
  }, 200);
  setTimeout(() => clearInterval(poll), 10000);
}

function togglePlay() {
  if (!scWidget || !scReady) return;
  scPlaying ? scWidget.pause() : scWidget.play();
}

function syncPlayer() {
  const playIcon  = scPlayBtn.querySelector('.icon-play');
  const pauseIcon = scPlayBtn.querySelector('.icon-pause');
  if (playIcon)  playIcon.style.display  = scPlaying ? 'none' : '';
  if (pauseIcon) pauseIcon.style.display = scPlaying ? ''     : 'none';
  record.setPlaying(scPlaying);
  tonearmEl.classList.toggle('playing', scPlaying);
}

recordEl.addEventListener('click', togglePlay);
tonearmEl.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPlayBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPrevBtn.addEventListener('click', e => { e.stopPropagation(); if (scWidget && scReady) scWidget.prev(); });
scNextBtn.addEventListener('click', e => { e.stopPropagation(); if (scWidget && scReady) scWidget.next(); });

// ── SCROLL ───────────────────────────────────────
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const d = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += d * 0.012; });
  record.vy += d * 0.012;
  lastScrollY = window.scrollY;
}, { passive: true });

// ── LOOP ─────────────────────────────────────────
(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  if (recordEl.classList.contains('visible')) {
    record.tick(mouseX, mouseY, now);
  }
  requestAnimationFrame(loop);
})(performance.now());

loadFromHash();

// ── LIGHTBOX ─────────────────────────────────────
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');

function openLightbox(src) {
  lbImg.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.classList.remove('open');
  lbImg.src = '';
  document.body.style.overflow = '';
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

['film-grid', 'bts-grid'].forEach(id => {
  const g = document.getElementById(id);
  if (g) g.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) openLightbox(img.src);
  });
});
