// =============================================
// Gabriel Abdo Alcântara — Portfolio
// Navigation + Floating Word Physics
// =============================================

// ── PAGE NAVIGATION ──────────────────────
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
  navWords.forEach(w => w.classList.toggle('active', w.dataset.page === key));
  updateRecordVisibility(key);
  history.pushState(null, '', key === 'cv' ? '/' : '#' + key);
  window.scrollTo(0, 0);
}

function loadFromHash() {
  const hash = location.hash.replace('#', '');
  showPage(pages[hash] ? hash : 'cv');
}

navWords.forEach(w => w.addEventListener('click', () => showPage(w.dataset.page)));
window.addEventListener('popstate', loadFromHash);


// ── MOUSE TRACKING + VELOCITY ──────────────
// mouseSpeed is an exponentially-smoothed px/event value.
// High = fast flick  → repulsion (existing feel).
// Low  = slow hover  → attraction (helps clicking).

let mouseX = -9999, mouseY = -9999;
let mouseSpeed = 0;                   // smoothed speed (px per event)
const SLOW_THRESHOLD = 5;             // px/event — below = intentional hover
const ATTRACT_RADIUS = 110;           // px — "very close" attraction zone
const REPEL_RADIUS   = 200;           // px — existing repulsion zone

document.addEventListener('mousemove', e => {
  const ddx = e.clientX - mouseX;
  const ddy = e.clientY - mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;
  const raw = Math.sqrt(ddx * ddx + ddy * ddy);
  // Exponential smoothing: damps sudden jumps so mode doesn't flicker
  mouseSpeed = mouseSpeed * 0.65 + raw * 0.35;
});

// Touch tracking (mobile) — treated as always "slow" for attraction
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX;
  mouseY = t.clientY;
  mouseSpeed = 0; // touch = intentional = always attract
}, { passive: true });

document.addEventListener('touchend', () => {
  mouseX = -9999;
  mouseY = -9999;
  mouseSpeed = 0;
});


// ── FLOATING WORD PHYSICS ──────────────────
class FloatingWord {
  constructor(el, startX, startY) {
    this.el = el;
    this.x  = startX;
    this.y  = startY;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.w  = 0;
    this.h  = 0;

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }

  measure() {
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
  }

  tick(mx, my) {
    const VW  = window.innerWidth;
    const VH  = window.innerHeight;
    const PAD = 18;

    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // ── Cursor interaction: repel OR attract based on mouse speed ──
    if (dist < REPEL_RADIUS) {
      if (mouseSpeed < SLOW_THRESHOLD && dist < ATTRACT_RADIUS) {
        // Slow, intentional hover → gentle gravitational pull toward cursor.
        // Strength scales with how slow the mouse is (0 at threshold → full at rest).
        const slowness = 1 - mouseSpeed / SLOW_THRESHOLD;
        const force    = slowness * ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS) * 0.22;
        this.vx -= (dx / dist) * force; // subtract = pull toward cursor
        this.vy -= (dy / dist) * force;
      } else if (mouseSpeed >= SLOW_THRESHOLD) {
        // Fast approach → repulsion (original behavior preserved)
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // ── Speed cap ──
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const MAX_SPEED = 3.2;
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    // ── Friction ──
    this.vx *= 0.984;
    this.vy *= 0.984;

    // ── Micro-drift when nearly stopped ──
    if (speed < 0.22) {
      this.vx += (Math.random() - 0.5) * 0.07;
      this.vy += (Math.random() - 0.5) * 0.07;
    }

    // ── Integrate ──
    this.x += this.vx;
    this.y += this.vy;

    // ── Bounce ──
    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.75; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.75; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.75; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.75; }

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }
}

function getStartPositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return [
    { x: vw * 0.08, y: vh * 0.10 }, // CV
    { x: vw * 0.52, y: vh * 0.44 }, // Film
    { x: vw * 0.22, y: vh * 0.68 }, // Music
  ];
}

const startPos = getStartPositions();
const floatingWords = Array.from(navWords).map((el, i) =>
  new FloatingWord(el, startPos[i].x, startPos[i].y)
);

document.fonts.ready.then(() => floatingWords.forEach(fw => fw.measure()));
window.addEventListener('resize', () => floatingWords.forEach(fw => fw.measure()));


// ── VINYL RECORD ───────────────────────────
class RecordPhysics {
  constructor(el, startX, startY) {
    this.el = el;
    this.x  = startX;
    this.y  = startY;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.w  = 0;
    this.h  = 0;

    this.angle     = 0;
    this.rpm       = 33;
    this.targetRpm = 33;
    this.lastTime  = null;

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';

    this.el.addEventListener('mouseenter', () => { this.targetRpm = 4; });
    this.el.addEventListener('mouseleave', () => { this.targetRpm = 33; });
  }

  measure() {
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
  }

  tick(mx, my, now) {
    const dt = this.lastTime !== null ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;

    // ── RPM easing ──
    this.rpm += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;

    // ── Physics ──
    const VW  = window.innerWidth;
    const VH  = window.innerHeight;
    const PAD = 18;

    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (dist < REPEL_RADIUS) {
      if (mouseSpeed < SLOW_THRESHOLD && dist < ATTRACT_RADIUS) {
        const slowness = 1 - mouseSpeed / SLOW_THRESHOLD;
        const force    = slowness * ((ATTRACT_RADIUS - dist) / ATTRACT_RADIUS) * 0.22;
        this.vx -= (dx / dist) * force;
        this.vy -= (dy / dist) * force;
      } else if (mouseSpeed >= SLOW_THRESHOLD) {
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const MAX_SPEED = 3.2;
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    this.vx *= 0.984;
    this.vy *= 0.984;

    if (speed < 0.22) {
      this.vx += (Math.random() - 0.5) * 0.07;
      this.vy += (Math.random() - 0.5) * 0.07;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.75; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.75; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.75; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.75; }

    this.el.style.left      = this.x + 'px';
    this.el.style.top       = this.y + 'px';
    this.el.style.transform = `rotate(${this.angle}deg)`;
  }
}

const recordEl = document.getElementById('record');
const record   = new RecordPhysics(
  recordEl,
  window.innerWidth  * 0.55,
  window.innerHeight * 0.35
);

document.fonts.ready.then(() => record.measure());
window.addEventListener('resize', () => record.measure());

function updateRecordVisibility(pageKey) {
  const isMusic = pageKey === 'music';
  recordEl.classList.toggle('visible', isMusic);
  if (!isMusic) record.lastTime = null;
}


// ── Scroll impulse ──
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const delta = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += delta * 0.035; });
  record.vy += delta * 0.035;
  lastScrollY = window.scrollY;
}, { passive: true });


// ── Main animation loop ──
(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  if (recordEl.classList.contains('visible')) {
    record.tick(mouseX, mouseY, now);
  }
  requestAnimationFrame(loop);
})(performance.now());


// ── Load initial page — called last so recordEl is initialized ──
loadFromHash();


// ── LIGHTBOX ─────────────────────────────────
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
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) openLightbox(img.src);
  });
});
