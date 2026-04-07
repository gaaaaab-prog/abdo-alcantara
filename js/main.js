// =============================================
// Gabriel Abdo AlcÃÂÃÂ¢ntara ÃÂ¢ÃÂÃÂ Portfolio
// =============================================


const pages = {
  cv:    document.getElementById('page-cv'),
  film:  document.getElementById('page-film'),
  music: document.getElementById('page-music'),
  'film-photo': document.getElementById('page-film-photo'),
};
const navWords = document.querySelectorAll('.nav-word');
const floatNav = document.getElementById('float-nav');
const navPulldownEl = document.getElementById('nav-pulldown');
const photoTabsEl = document.getElementById('photo-tabs');

function showPage(key) {
  if (!pages[key]) return;
  closeLightbox();
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  navWords.forEach(w => {
    const on = w.dataset.page === key;
    w.classList.toggle('active',   on);
    w.classList.toggle('inactive', !on);
  });
  updateRecordVisibility(key);
  history.pushState(null, '', key === 'cv' ? window.location.pathname : '#' + key);
  window.scrollTo(0, 0);
  setTimeout(() => floatingWords.forEach(fw => fw.measure()), 50);

  // Photo page ÃÂ¢ÃÂÃÂ collapse nav, show tabs + floating images
  const isPhoto = key === 'film-photo';
  const isMusic = key === 'music';
  floatNav.classList.toggle('photo-active', isPhoto);
  floatNav.classList.toggle('music-active', isMusic);
  navPulldownEl.classList.toggle('visible', isPhoto || isMusic);
  photoTabsEl.classList.toggle('visible', isPhoto);
  if (isPhoto) initPhotoFloat(); else destroyPhotoFloat();
  if (scrollArrow) scrollArrow.style.display = isPhoto ? 'none' : '';
}

navWords.forEach(w => {
  w.addEventListener('click',      () => showPage(w.dataset.page));
  w.addEventListener('mouseenter', () => w.classList.remove('inactive'));
});
window.addEventListener('popstate', () => {
  const h = location.hash.replace('#', '');
  showPage(pages[h] ? h : 'cv');
});

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ MOUSE TRACKING ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
let mouseX = -9999, mouseY = -9999, mouseSpeed = 0;
let mouseActive = false, mouseIdleTimer = null;

document.addEventListener('mousemove', e => {
  const dx = e.clientX - mouseX, dy = e.clientY - mouseY;
  mouseX = e.clientX; mouseY = e.clientY;
  mouseSpeed = mouseSpeed * 0.65 + Math.sqrt(dx * dx + dy * dy) * 0.35;
  mouseActive = true;
  clearTimeout(mouseIdleTimer);
  mouseIdleTimer = setTimeout(() => { mouseActive = false; }, 5000);
});
document.addEventListener('touchmove', e => {
  const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseSpeed = 0;
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = -9999; mouseY = -9999; mouseSpeed = 0; });

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ FILM TABS ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
document.querySelectorAll('.film-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.film-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.film-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('tab-' + tab.dataset.filmTab);
    if (target) target.classList.add('active');
  });
});


// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ CV TABS ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
document.querySelectorAll('.cv-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cv-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cv-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('cv-tab-' + tab.dataset.cvTab);
    if (target) target.classList.add('active');
  });
});

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ PHOTO CONFIG (before showPage for TDZ safety) ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Photo images ÃÂ¢ÃÂÃÂ updated automatically by the folder-sync task
// { src: 'images/photo/digital/rhr1talks_web/filename.jpg', type: 'digital'|'analog' }
const PHOTO_PLACEHOLDERS = [
  { src: 'images/photo/digital/rhr1talks_web/altman-1.jpg',  type: 'digital', ar: 1.500 },
  { src: 'images/photo/digital/rhr1talks_web/altman-2.jpg',  type: 'digital', ar: 0.667 },
  { src: 'images/photo/digital/rhr1talks_web/altman-3.jpg',  type: 'digital', ar: 1.500 },
  { src: 'images/photo/digital/rhr1talks_web/altman-4.jpg',  type: 'digital', ar: 0.667 },
  { src: 'images/photo/digital/rhr1talks_web/altman-5.jpg',  type: 'digital', ar: 0.679 },
  { src: 'images/photo/digital/rhr1talks_web/altman-6.jpg',  type: 'digital', ar: 1.778 },
  { src: 'images/photo/digital/rhr1talks_web/altman-7.jpg',  type: 'digital', ar: 0.680 },
  { src: 'images/photo/digital/rhr1talks_web/altman-8.jpg',  type: 'digital', ar: 0.568 },
  { src: 'images/photo/digital/rhr1talks_web/altman-9.jpg',  type: 'digital', ar: 1.500 },
  { src: 'images/photo/digital/rhr1talks_web/altman-10.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/digital/rhr1talks_web/altman-11.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/digital/rhr1talks_web/altman-12.jpg', type: 'digital', ar: 1.500 },
];

const PHOTO_FRICTION = 0.9917;
const PHOTO_DRIFT   = 0.00184;
const PHOTO_MAX_SPEED = 2.3;


// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ FLOATING WORD ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Words burst outward from near-centre on load (~120ÃÂÃÂ° apart), decelerating
// via friction. Drift direction rotates slowly for aimless-looking float.
// Fast mouse swipe pushes; slow approach attracts. Soft edge avoidance +
// inter-word repulsion keep words separated and on-screen.
const FRICTION    = 0.991;  // terminal speed ÃÂ¢ÃÂÃÂ 0.001/0.006 ÃÂ¢ÃÂÃÂ 0.17 px/frame
const DRIFT_FORCE = 0.002;  // continuous gentle push along _driftAngle
const MAX_SPEED   = 2.5;    // high cap so the launch burst isn't clipped

class FloatingWord {
  constructor(el, x, y, spreadAngle) {
    this.el = el;
    this.x  = x; this.y  = y;
    this.w  = 0; this.h  = 0;

    // Drift direction aligned with spread angle so initial momentum and
    // long-term force agree ÃÂ¢ÃÂÃÂ no jarring direction fight during deceleration.
    this._driftAngle      = spreadAngle;
    // Full spin every ~2ÃÂ¢ÃÂÃÂ6 minutes ÃÂ¢ÃÂÃÂ change is imperceptible frame-to-frame.
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1)
                            * (0.0003 + Math.random() * 0.0005);

    // Strong outward launch ÃÂ¢ÃÂÃÂ words snap apart from centre immediately.
    this.vx = Math.cos(spreadAngle) * 2.0;
    this.vy = Math.sin(spreadAngle) * 2.0;

    el.style.transform = `translate3d(${x}px,${y}px,0)`;
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  tick(mx, my) {
    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;

    // Mouse interaction ÃÂ¢ÃÂÃÂ slow approach attracts, fast swipe pushes
    const ddx = mx - cx, ddy = my - cy;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
    if (mouseActive && dist < 120) {
      if (mouseSpeed > 8) {
        // Fast swipe ÃÂ¢ÃÂÃÂ push word away
        const pushF = Math.min(mouseSpeed * 0.004, 0.3);
        this.vx -= (ddx / dist) * pushF;
        this.vy -= (ddy / dist) * pushF;
      } else if (mouseSpeed < 2) {
        // Slow/still ÃÂ¢ÃÂÃÂ gentle attract
        this.vx += (ddx / dist) * 0.002;
        this.vy += (ddy / dist) * 0.002;
      }
    }

    // Rotate drift direction; very rarely nudge the spin rate for variety.
    this._driftAngle += this._driftAngleSpeed;
    if (Math.random() < 0.0005) {
      this._driftAngleSpeed += (Math.random() - 0.5) * 0.0002;
      this._driftAngleSpeed = Math.max(-0.0009, Math.min(0.0009, this._driftAngleSpeed));
    }
    this.vx += Math.cos(this._driftAngle) * DRIFT_FORCE;
    this.vy += Math.sin(this._driftAngle) * DRIFT_FORCE;

    // Gentle center gravity
    const gcx = VW * 0.5 - cx, gcy = VH * 0.42 - cy;
    const gd = Math.sqrt(gcx * gcx + gcy * gcy) || 1;
    this.vx += (gcx / gd) * 0.0006;
    this.vy += (gcy / gd) * 0.0006;

    // Speed cap + friction
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > MAX_SPEED) { const r = MAX_SPEED / spd; this.vx *= r; this.vy *= r; }
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    // Soft edge avoidance ÃÂ¢ÃÂÃÂ gentle push away from margins
    const MARGIN = 160;
    if (this.x < MARGIN) { this.vx += 0.003 * (MARGIN - this.x) / MARGIN; }
    if (this.x + this.w > VW - MARGIN) { this.vx -= 0.003 * (this.x + this.w - (VW - MARGIN)) / MARGIN; }
    if (this.y < MARGIN) { this.vy += 0.003 * (MARGIN - this.y) / MARGIN; }
    if (this.y + this.h > VH - MARGIN) { this.vy -= 0.025 * (this.y + this.h - (VH - MARGIN)) / MARGIN; }

    // Hard boundary ÃÂ¢ÃÂÃÂ keep on screen
    if (this.x < PAD) { this.x = PAD; this.vx = Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.y < PAD) { this.y = PAD; this.vy = Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }
    if (this.y + this.h > VH - 130) { this.y = VH - this.h - 130; this.vy = -Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }

    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ RECORD PHYSICS ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Separate class ÃÂ¢ÃÂÃÂ the record has its own impulse drift that is much calmer
// and fully respects user drag placement (5 s cooldown after every interaction).
class RecordPhysics {
  constructor(el, x, y) {
    this.el        = el;
    this.x         = x; this.y  = y;
    this.vx        = 0; this.vy = 0;
    this.w         = 0; this.h  = 0;
    this.vinylEl   = el.querySelector('.record-vinyl');
    this.angle     = 0;
    this.rpm       = 0;
    this.targetRpm = 0;
    this._playing  = false;
    this.lastTime  = null;
    this.dragging  = false;
    this.dragOffX  = 0; this.dragOffY  = 0;
    this._didDrag  = false;
    this._cooldown   = 300;
    this._driftCount = 0;
    this._driftTimer = 300 + Math.floor(Math.random() * 360);

    el.addEventListener('mouseenter', () => { if (!this.dragging) this.targetRpm = 4; });
    el.addEventListener('mouseleave', () => { if (!this.dragging) this.targetRpm = this._playing ? 33 : 0; });
    el.addEventListener('mousedown',  e => { e.preventDefault(); this._startDrag(e.clientX, e.clientY); });
    el.addEventListener('touchstart', e => { const t = e.touches[0]; this._startDrag(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener('mousemove', e => { if (this.dragging) this._moveDrag(e.clientX, e.clientY); });
    document.addEventListener('mouseup',   () => this._endDrag());
    document.addEventListener('touchmove', e => { if (this.dragging) { const t = e.touches[0]; this._moveDrag(t.clientX, t.clientY); } }, { passive: true });
    document.addEventListener('touchend',  () => this._endDrag());
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  _startDrag(px, py) {
    this.dragging = true; this._didDrag = false;
    this.dragOffX = px - this.x; this.dragOffY = py - this.y;
    this.vx = 0; this.vy = 0;
    this.el.classList.add('dragging');
  }

  _moveDrag(px, py) {
    this._didDrag = true;
    this.x = px - this.dragOffX;
    this.y = py - this.dragOffY;
    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }

  _endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.classList.remove('dragging');
    this.vx = 0; this.vy = 0;
    this._cooldown = 300;
  }

  setPlaying(on) { this._playing = on; this.targetRpm = on ? 33 : 0; }

  tick(mx, my, now) {
    const dt = this.lastTime ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    this.rpm   += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;
    if (this.vinylEl) this.vinylEl.style.transform = `rotate(${this.angle}deg)`;
    if (this.dragging) return;

    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;

    if (this._cooldown > 0) {
      this._cooldown--;
    } else {
      this._driftCount++;
      if (this._driftCount >= this._driftTimer) {
        this._driftCount = 0;
        this._driftTimer = 300 + Math.floor(Math.random() * 360);
        const a = Math.random() * Math.PI * 2;
        this.vx += Math.cos(a) * (0.04 + Math.random() * 0.06);
        this.vy += Math.sin(a) * (0.04 + Math.random() * 0.06);
      }
    }

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > 0.45) { const r = 0.45 / spd; this.vx *= r; this.vy *= r; }
    this.vx *= 0.960; this.vy *= 0.960;
    this.x += this.vx; this.y += this.vy;

    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.3; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.3; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.3; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.3; }

    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ INIT ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Words burst from near-centre, evenly spread 120ÃÂÃÂ° apart (random base angle).
const floatingWords = (() => {
  const cx   = window.innerWidth  * 0.5;
  const cy   = window.innerHeight * 0.5;
  const base = Math.random() * Math.PI * 2;
  const n    = navWords.length;
  return Array.from(navWords).map((el, i) => new FloatingWord(
    el,
    cx + (Math.random() - 0.5) * 20,
    cy + (Math.random() - 0.5) * 15,
    base + (i / n) * Math.PI * 2
  ));
})();

const recordEl  = document.getElementById('record');
const tonearmEl = document.getElementById('tonearm');
const record    = new RecordPhysics(recordEl, window.innerWidth * 0.55, window.innerHeight * 0.35);

document.fonts.ready.then(() => { floatingWords.forEach(fw => fw.measure()); record.measure(); });
window.addEventListener('resize',    () => { floatingWords.forEach(fw => fw.measure()); record.measure(); });

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ RECORD VISIBILITY ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
function updateRecordVisibility(key) {
  const on = key === 'music';
  recordEl.classList.toggle('visible', on);
  if (!on) {
    record.lastTime = null;
  }
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ TONEARM ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Rest: arm parallel, needle clear of groove. Play: drops to outer groove then
// sweeps toward the label over the track duration. CSS transition (1.5 s) on
// the SVG element interpolates every angle change ÃÂ¢ÃÂÃÂ including the slow 2 s
// poll steps during playback ÃÂ¢ÃÂÃÂ so the sweep reads as perfectly continuous.
const TONEARM_REST  = 55;    // resting off record
const TONEARM_OUTER = 47;   // needle at outer groove
const TONEARM_INNER =  3;   // needle near label edge
const tonearmSvg    = tonearmEl.querySelector('svg');
let tonearmInterval = null, tonearmFinishTimer = null, scDuration = 0;

function setTonearmAngle(deg) { tonearmSvg.style.transform = `rotate(${deg}deg)`; }

function startTonearmSweep(isResume) {
  clearInterval(tonearmInterval);
  clearTimeout(tonearmFinishTimer);
  if (!isResume) {
    scWidget.getCurrentSound(s => {
      scDuration = s && s.duration ? s.duration : 0;
      setTonearmAngle(TONEARM_OUTER);
    });
  }
  tonearmInterval = setInterval(() => {
    if (!scDuration) return;
    scWidget.getPosition(pos => {
      const pct = Math.min(pos / scDuration, 1);
      setTonearmAngle(TONEARM_OUTER + (TONEARM_INNER - TONEARM_OUTER) * pct);
      const bar = document.getElementById('sc-progress-bar');
      const el  = document.getElementById('sc-elapsed');
      if (bar) bar.style.width = (pct * 100).toFixed(1) + '%';
      if (el) { const s = Math.floor(pos/1000); el.textContent = Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
    });
  }, 2000);
}

// Needle stays in groove on pause ÃÂ¢ÃÂÃÂ tonearm holds position
function pauseTonearm() {
  clearInterval(tonearmInterval);
  tonearmInterval = null;
}

// Track finished naturally ÃÂ¢ÃÂÃÂ land at label edge, lift back to rest after 2.5s
function finishTonearm() {
  clearInterval(tonearmInterval);
  tonearmInterval = null;
  scDuration = 0;
  setTonearmAngle(TONEARM_INNER);
  tonearmFinishTimer = setTimeout(() => setTonearmAngle(TONEARM_REST), 2500);
}

function stopTonearmSweep() {
  clearInterval(tonearmInterval);
  clearTimeout(tonearmFinishTimer);
  tonearmInterval = null;
  scDuration      = 0;
  setTonearmAngle(TONEARM_REST);
  const _bar = document.getElementById('sc-progress-bar');
  const _el  = document.getElementById('sc-elapsed');
  if (_bar) _bar.style.width = '0%';
  if (_el)  _el.textContent = '0:00';
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SOUNDCLOUD ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
const SC_TRACKS = [
  'https://soundcloud.com/gabd0/5-el-cronopio',
  'https://soundcloud.com/gabd0/4-huella',
  'https://soundcloud.com/gabd0/c3331b42-8ae1-4b01-acf1-cea184ad11f5',
  'https://soundcloud.com/gabd0/gabdo23-wav',
  'https://soundcloud.com/gabd0/gabdo1-vinyl-mix',
];
const SC_TRACK_TITLES = ['5', '4 - huella', '3 - a love letter', '2', '1'];

let scWidget = null, scReady = false, scPlaying = false, scPendingPlay = false, scTrackIdx = 0;
let scPauseTimer = null;

const scPlayerEl  = document.getElementById('sc-player');
const scTrackName = document.getElementById('sc-track-name');
const scPlayBtn   = document.getElementById('sc-play');
const scPrevBtn   = document.getElementById('sc-prev');
const scNextBtn   = document.getElementById('sc-next');
const scCloseBtn  = document.getElementById('sc-close');
const scIframe    = document.getElementById('sc-iframe');

if (typeof SC !== 'undefined' && scIframe) {
  scWidget = SC.Widget(scIframe);

  scWidget.bind(SC.Widget.Events.READY, () => {
    scReady = true;
    if (scPendingPlay) { scPendingPlay = false; scWidget.play(); }
  });

  scWidget.bind(SC.Widget.Events.PLAY, () => {
    scPlaying = true;
    clearTimeout(scPauseTimer);
    scWidget.getCurrentSound(s => {
      scTrackName.textContent = (s ? s.title : SC_TRACK_TITLES[scTrackIdx]) + ' - (soundcloud)';
    });
    syncPlayer();
  });

  scWidget.bind(SC.Widget.Events.PAUSE, () => {
    scPlaying = false;
    syncPlayer('pause');
    scPauseTimer = setTimeout(() => scPlayerEl.classList.remove('visible'), 2 * 60 * 1000);
  });

  scWidget.bind(SC.Widget.Events.FINISH, () => {
    scPlaying = false;
    syncPlayer('finish');
    loadTrack((scTrackIdx + 1) % SC_TRACKS.length, true);
  });
}

function loadTrack(idx, autoPlay) {
  if (!scWidget) return;
  scTrackIdx = ((idx % SC_TRACKS.length) + SC_TRACKS.length) % SC_TRACKS.length;
  scReady = false; scPlaying = false;
  if (autoPlay) scPendingPlay = true;
  scTrackName.textContent = SC_TRACK_TITLES[scTrackIdx] + ' - (soundcloud)';
  scWidget.load(SC_TRACKS[scTrackIdx], {
    auto_play: false, hide_related: true, show_comments: false,
    show_user: false, show_reposts: false, show_teaser: false, visual: true,
  });
}

function togglePlay() {
  if (!scWidget) return;
  if (!scReady) { scPendingPlay = true; return; }
  scPlaying ? scWidget.pause() : scWidget.play();
}

function syncPlayer(reason) {
  const ip  = scPlayBtn.querySelector('.icon-play');
  const ip2 = scPlayBtn.querySelector('.icon-pause');
  if (ip)  ip.style.display  = scPlaying ? 'none' : '';
  if (ip2) ip2.style.display = scPlaying ? ''     : 'none';
  record.setPlaying(scPlaying);
  if (scPlaying)                startTonearmSweep(scDuration > 0);
  else if (reason === 'finish') finishTonearm();
  else if (reason === 'pause')  pauseTonearm();
  else                          stopTonearmSweep();
}

recordEl.addEventListener('click', () => {
  if (record._didDrag) { record._didDrag = false; return; }
  scPlayerEl.classList.add('visible');
  scTrackName.textContent = SC_TRACK_TITLES[scTrackIdx] + ' - (soundcloud)';
  togglePlay();
});

scCloseBtn.addEventListener('click',  e => {
  e.stopPropagation();
  clearTimeout(scPauseTimer);
  if (scWidget && scPlaying) scWidget.pause();
  scPlayerEl.classList.remove('visible');
});
tonearmEl.addEventListener('click',   e => { e.stopPropagation(); togglePlay(); });
scPlayBtn.addEventListener('click',   e => { e.stopPropagation(); togglePlay(); });
scPrevBtn.addEventListener('click',   e => { e.stopPropagation(); loadTrack(scTrackIdx - 1, scPlaying); });
scNextBtn.addEventListener('click',   e => { e.stopPropagation(); loadTrack(scTrackIdx + 1, scPlaying); });

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ RAF LOOP ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
// Soft word separation ÃÂ¢ÃÂÃÂ push scales with actual word sizes so edges never overlap
const REPULSE_FORCE = 0.045;

(function loop(now) {
    if (document.hidden) { requestAnimationFrame(loop); return; }
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  // Soft repulsion ÃÂ¢ÃÂÃÂ min distance from actual word widths so edges never overlap
  for (let i = 0; i < floatingWords.length; i++) {
    for (let j = i + 1; j < floatingWords.length; j++) {
      const a = floatingWords[i], b = floatingWords[j];
      const dx = (b.x + b.w * 0.5) - (a.x + a.w * 0.5);
      const dy = (b.y + b.h * 0.5) - (a.y + a.h * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const minDist = (a.w + b.w) * 0.5 + 40;
      if (dist < minDist) {
        const nx = dx / dist, ny = dy / dist;
        const f = REPULSE_FORCE * (1 - dist / minDist);
        a.vx -= nx * f;  a.vy -= ny * f;
        b.vx += nx * f;  b.vy += ny * f;
        if (dist < minDist * 0.85) {
          const push = (minDist * 0.85 - dist) * 0.12;
          a.x -= nx * push;  a.y -= ny * push;
          b.x += nx * push;  b.y += ny * push;
        }
      }
    }
  }
  if (recordEl.classList.contains('visible')) record.tick(mouseX, mouseY, now);
  requestAnimationFrame(loop);
})(performance.now());

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ VISIBILITY (save CPU/battery when tab hidden) ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    record.lastTime = null;   // prevent huge dt jump on resume
  }
});

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ SCROLL ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
const scrollArrow = document.getElementById('scroll-arrow');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > window.innerHeight * 0.15;
  floatNav.classList.toggle('scrolled', scrolled);
  if (scrollArrow) {
    if (window.scrollY > 40) {
      scrollArrow.classList.remove('visible');
    } else {
      scrollArrow.classList.add('visible');
    }
  }
  // Show pulldown globally when scrolled (not just Photo page)
  if (navPulldownEl && !floatNav.classList.contains('photo-active') && !floatNav.classList.contains('music-active')) {
    navPulldownEl.classList.toggle('visible', scrolled);
  }
}, { passive: true });
if (scrollArrow) {
  scrollArrow.classList.add('visible');
  scrollArrow.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  });
  setInterval(() => {
    scrollArrow.classList.remove('bobbing');
    void scrollArrow.offsetWidth;
    scrollArrow.classList.add('bobbing');
  }, 300000);
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ HERO-NAME CLICK ÃÂ¢ÃÂÃÂ HOME ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
document.querySelectorAll('.hero-name, .hero-tagline').forEach(el => {
  el.style.cursor = 'pointer';
  el.style.pointerEvents = 'all';
  el.addEventListener('click', () => showPage('cv'));
});



// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ PHOTO FLOATING IMAGES ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
class FloatingImage {
  constructor(el, x, y, angle) {
    this.el = el;
    this.x = x; this.y = y;
    this.h = 72;
    const _ar = parseFloat(el.dataset.ar) || 1; this.w = Math.round(72 * _ar); el.style.width = this.w + 'px'; el.style.height = '72px';
    this._driftAngle = angle;
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0005);
    this.vx = Math.cos(angle) * 1.8;
    this.vy = Math.sin(angle) * 1.8;
    this._hoverStart = 0;
    this._magnified = false;
    this._enlarged = false;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    el.addEventListener('mouseenter', () => { this._hoverStart = Date.now(); });
    el.addEventListener('mouseleave', () => {
      this._hoverStart = 0;
      if (this._magnified && !this._enlarged) {
        this._magnified = false;
        el.classList.remove('magnified');
        this.w = 72; this.h = 72;
      }
    });
    el.addEventListener('click', (e) => { e.stopPropagation(); if (!this._enlarged) this.toggleEnlarge(); });
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  toggleEnlarge() {
    const ctr = document.getElementById('photo-float-container');
    if (this._enlarged) {
      this._enlarged = false; this._magnified = false;
      this.el.classList.remove('enlarged', 'magnified');
      this.el.style.left = '';
      this.el.style.top = '';
      this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
      ctr.classList.remove('has-enlarged');
      this.w = 72; this.h = 72;
    } else {
      floatingImages.forEach(fi => {
        fi._enlarged = false; fi._magnified = false;
        fi.el.classList.remove('enlarged', 'magnified');
      });
      this._enlarged = true;
      this.el.classList.add('enlarged');
      this.el.style.left = '17.5vw';
      this.el.style.top = '17.5vh';
      this.el.style.transform = 'none';
      ctr.classList.add('has-enlarged');
    }
  }

  tick(mx, my) {
    if (this._enlarged) return;
    const VW = window.innerWidth, VH = window.innerHeight;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;

    if (this._hoverStart > 0 && !this._magnified && Date.now() - this._hoverStart > 850) {
      this._magnified = true;
      this.el.classList.add('magnified');
      setTimeout(() => { if (this.el.isConnected) this.measure(); }, 520);
    }

    const ddx = mx - cx, ddy = my - cy;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
    if (mouseActive && dist < 120) {
      if (mouseSpeed > 8) {
        const pf = Math.min(mouseSpeed * 0.004, 0.3);
        this.vx -= (ddx / dist) * pf; this.vy -= (ddy / dist) * pf;
      } else if (mouseSpeed < 2) {
        this.vx += (ddx / dist) * 0.002; this.vy += (ddy / dist) * 0.002;
      }
    }

    this._driftAngle += this._driftAngleSpeed;
    if (Math.random() < 0.0005) {
      this._driftAngleSpeed += (Math.random() - 0.5) * 0.0002;
      this._driftAngleSpeed = Math.max(-0.0009, Math.min(0.0009, this._driftAngleSpeed));
    }
    this.vx += Math.cos(this._driftAngle) * PHOTO_DRIFT;
    this.vy += Math.sin(this._driftAngle) * PHOTO_DRIFT;

    const gcx = VW * 0.5 - cx, gcy = VH * 0.42 - cy;
    const gd = Math.sqrt(gcx * gcx + gcy * gcy) || 1;
    this.vx += (gcx / gd) * 0.0006; this.vy += (gcy / gd) * 0.0006;

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > PHOTO_MAX_SPEED) { const r = PHOTO_MAX_SPEED / spd; this.vx *= r; this.vy *= r; }
    this.vx *= PHOTO_FRICTION; this.vy *= PHOTO_FRICTION;
    this.x += this.vx; this.y += this.vy;

    const MARGIN = 160, PAD = 18;
    if (this.x < MARGIN) this.vx += 0.003 * (MARGIN - this.x) / MARGIN;
    if (this.x + this.w > VW - MARGIN) this.vx -= 0.003 * (this.x + this.w - (VW - MARGIN)) / MARGIN;
    if (this.y < MARGIN) this.vy += 0.003 * (MARGIN - this.y) / MARGIN;
    if (this.y + this.h > VH - MARGIN) this.vy -= 0.025 * (this.y + this.h - (VH - MARGIN)) / MARGIN;

    if (this.x < PAD) { this.x = PAD; this.vx = Math.abs(this.vx) * 0.2; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.2; }
    if (this.y < PAD) { this.y = PAD; this.vy = Math.abs(this.vy) * 0.2; }
    if (this.y + this.h > VH - 130) { this.y = VH - this.h - 130; this.vy = -Math.abs(this.vy) * 0.2; }

    this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
  }
}

let floatingImages = [];
let photoAnimFrame = null;

function getActivePhotoFilters() {
  const types = [];
  document.querySelectorAll('.photo-tab.active').forEach(t => types.push(t.dataset.photoTab));
  if (types.length === 0) types.push('digital', 'analog');
  return { types };
}

function initPhotoFloat() {
  destroyPhotoFloat();
  const container = document.getElementById('photo-float-container');
  if (!container) return;
  const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.4;
  const base = Math.random() * Math.PI * 2;
  // Always create ALL images ÃÂ¢ÃÂÃÂ updatePhotoFilter handles visibility
  const pool = PHOTO_PLACEHOLDERS;
  const count = Math.min(pool.length, 12);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'float-img';
    var _s=pool[i].src.split('/'),_pi=_s.indexOf('photo'); el.dataset.type=(_pi>=0&&_s[_pi+1])||pool[i].type||'digital';
    el.dataset.ar = pool[i].ar || 1;
    el.innerHTML = pool[i].src
      ? '<img src="' + pool[i].src + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" loading="lazy" />'
      : '<div style="width:100%;height:100%;background:var(--ph-bg);display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:#b8b8b2;">' + pool[i].type[0].toUpperCase() + (i + 1) + '</div>';
    container.appendChild(el);
    const angle = base + (i / count) * Math.PI * 2;
    floatingImages.push(new FloatingImage(el, cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 30, angle));
  }

  setTimeout(() => { floatingImages.forEach(fi => fi.measure()); updatePhotoFilter(); }, 100);

  (function photoLoop() {
      if (document.hidden) { photoAnimFrame = requestAnimationFrame(photoLoop); return; }
    floatingImages.forEach(fi => fi.tick(mouseX, mouseY));
    for (let i = 0; i < floatingImages.length; i++) {
      for (let j = i + 1; j < floatingImages.length; j++) {
        const a = floatingImages[i], b = floatingImages[j];
        if (a._enlarged || b._enlarged) continue;
        const dx = (b.x + b.w * 0.5) - (a.x + a.w * 0.5);
        const dy = (b.y + b.h * 0.5) - (a.y + a.h * 0.5);
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const md = (a.w + b.w) * 0.5 + 20;
        if (d < md) {
          const nx = dx / d, ny = dy / d, f = 0.03 * (1 - d / md);
          a.vx -= nx * f; a.vy -= ny * f;
          b.vx += nx * f; b.vy += ny * f;
        }
      }
    }
    photoAnimFrame = requestAnimationFrame(photoLoop);
  })();
}

function destroyPhotoFloat() {
  if (photoAnimFrame) { cancelAnimationFrame(photoAnimFrame); photoAnimFrame = null; }
  const ctr = document.getElementById('photo-float-container');
  if (ctr) ctr.innerHTML = '';
  floatingImages = [];
}

function updatePhotoFilter() {
  const af = getActivePhotoFilters();
  floatingImages.forEach(fi => {
    const match = af.types.includes(fi.el.dataset.type);
    fi.el.style.opacity = match ? '' : '0';
    fi.el.style.pointerEvents = match ? '' : 'none';
  });
}

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ PHOTO TAB TOGGLE (non-exclusive) ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
document.querySelectorAll('.photo-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.photo-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updatePhotoFilter();
  });
});

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ NAV PULLDOWN ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
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
document.addEventListener('click', () => { if (pulldownMenu) pulldownMenu.classList.remove('open');
  if (pulldownToggle) pulldownToggle.setAttribute('aria-expanded', 'false'); });

// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ LIGHTBOX ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');

function openLightbox(src) { lbImg.src = src; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLightbox()   { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }

document.getElementById('lb-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
document.addEventListener('click', () => { floatingImages.forEach(fi => { if (fi._enlarged) fi.toggleEnlarge(); }); });

['film-grid', 'bts-grid'].forEach(id => {
  const g = document.getElementById(id);
  if (g) g.addEventListener('click', e => { const img = e.target.closest('img'); if (img) openLightbox(img.src); });
});


// ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ INITIAL ROUTE ÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂÃÂ¢ÃÂÃÂ
const _h = location.hash.replace('#', '');
showPage(pages[_h] ? _h : 'cv');
