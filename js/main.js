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

  // Swap visible page
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');

  // Update active word
  navWords.forEach(w => w.classList.toggle('active', w.dataset.page === key));

  // Show/hide vinyl record
  updateRecordVisibility(key);

  // Update URL
  history.pushState(null, '', key === 'cv' ? '/' : '#' + key);
  window.scrollTo(0, 0);
}

function loadFromHash() {
  const hash = location.hash.replace('#', '');
  showPage(pages[hash] ? hash : 'cv');
}

navWords.forEach(w => w.addEventListener('click', () => showPage(w.dataset.page)));
window.addEventListener('popstate', loadFromHash);
loadFromHash();


// ── FLOATING WORD PHYSICS ──────────────────
// Each word drifts slowly in zero gravity,
// bounces off viewport edges,
// and repels away from the cursor.

class FloatingWord {
  constructor(el, startX, startY) {
    this.el = el;
    this.x  = startX;
    this.y  = startY;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.w  = 0;
    this.h  = 0;

    // Apply initial position
    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }

  // Measure rendered size (call after fonts load)
  measure() {
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
  }

  tick(mx, my) {
    const VW  = window.innerWidth;
    const VH  = window.innerHeight;
    const PAD = 18;            // keep words away from edges
    const REPEL_RADIUS = 200; // px — cursor influence zone

    // ── Cursor repulsion ──
    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (dist < REPEL_RADIUS) {
      const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    // ── Speed cap ──
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const MAX_SPEED = 3.2;
    if (speed > MAX_SPEED) {
      this.vx = (this.vx / speed) * MAX_SPEED;
      this.vy = (this.vy / speed) * MAX_SPEED;
    }

    // ── Friction / dampen ──
    this.vx *= 0.984;
    this.vy *= 0.984;

    // ── Keep alive — micro-drift if nearly stopped ──
    if (speed < 0.22) {
      this.vx += (Math.random() - 0.5) * 0.07;
      this.vy += (Math.random() - 0.5) * 0.07;
    }

    // ── Integrate ──
    this.x += this.vx;
    this.y += this.vy;

    // ── Bounce off viewport edges ──
    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.75; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.75; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.75; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.75; }

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }
}

// Spread initial positions so words don't stack
function getStartPositions() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return [
    { x: vw * 0.08,  y: vh * 0.10 }, // CV   — top-left area
    { x: vw * 0.52,  y: vh * 0.44 }, // Film — center
    { x: vw * 0.22,  y: vh * 0.68 }, // Music — lower-left
  ];
}

const startPos = getStartPositions();
const floatingWords = Array.from(navWords).map((el, i) => {
  return new FloatingWord(el, startPos[i].x, startPos[i].y);
});

// Measure after fonts are ready
document.fonts.ready.then(() => floatingWords.forEach(fw => fw.measure()));
window.addEventListener('resize',  () => floatingWords.forEach(fw => fw.measure()));

// ── Mouse tracking ──
let mouseX = -9999, mouseY = -9999;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ── Touch tracking (mobile) ──
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX;
  mouseY = t.clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
  mouseX = -9999;
  mouseY = -9999;
});


// ── VINYL RECORD ───────────────────────────
// Floats with the same physics as the nav words.
// Spins at 33 rpm (time-based, frame-rate independent).
// Hover slows it to ~4 rpm; mouse-leave returns to 33.

class RecordPhysics {
  constructor(el, startX, startY) {
    this.el = el;
    this.x  = startX;
    this.y  = startY;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.w  = 0;
    this.h  = 0;

    this.angle     = 0;       // current rotation in degrees
    this.rpm       = 33;      // current playback speed
    this.targetRpm = 33;      // what rpm is easing toward
    this.lastTime  = null;    // for dt calculation

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';

    // Hover slows the record like a hand on the platter
    this.el.addEventListener('mouseenter', () => { this.targetRpm = 4; });
    this.el.addEventListener('mouseleave', () => { this.targetRpm = 33; });
  }

  measure() {
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
  }

  tick(mx, my, now) {
    // Time delta in seconds — 0 on first call to avoid jump
    const dt = this.lastTime !== null ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;

    // ── RPM easing ──
    this.rpm += (this.targetRpm - this.rpm) * 0.03;

    // ── Rotation: rpm × 6 = degrees per second ──
    this.angle += this.rpm * 6 * dt;

    // ── Physics (identical to FloatingWord) ──
    const VW  = window.innerWidth;
    const VH  = window.innerHeight;
    const PAD = 18;
    const REPEL_RADIUS = 200;

    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (dist < REPEL_RADIUS) {
      const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
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
  if (!isMusic) record.lastTime = null; // reset so no angle jump on re-show
}

// ── Scroll impulse — nudges all floaters ──
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

// Delegate click on grid images (works as images are added later)
['film-grid', 'bts-grid'].forEach(id => {
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) openLightbox(img.src);
  });
});
