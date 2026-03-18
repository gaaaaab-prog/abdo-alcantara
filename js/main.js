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


// ── MOUSE TRACKING + SPEED ─────────────────
// Fast mouse  → repulsion (existing feel)
// Slow mouse  → direct lerp toward cursor (no spring, just settles)

let mouseX = -9999, mouseY = -9999;
let mouseSpeed = 0;
const SLOW_THRESHOLD = 5;   // px/event — below = intentional hover
const ATTRACT_RADIUS  = 110; // px — zone where slow hover pulls element in
const REPEL_RADIUS    = 200; // px

document.addEventListener('mousemove', e => {
  const ddx = e.clientX - mouseX;
  const ddy = e.clientY - mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;
  const raw = Math.sqrt(ddx * ddx + ddy * ddy);
  mouseSpeed = mouseSpeed * 0.65 + raw * 0.35; // smoothed
});

document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouseX = t.clientX;
  mouseY = t.clientY;
  mouseSpeed = 0; // touch always = slow
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
    const VW   = window.innerWidth;
    const VH   = window.innerHeight;
    const PAD  = 18;

    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (mouseSpeed < SLOW_THRESHOLD && dist < ATTRACT_RADIUS) {
      // Slow hover: slide element toward cursor via lerp.
      // No force = no velocity buildup = no spring/oscillation.
      const slowness = 1 - mouseSpeed / SLOW_THRESHOLD;
      const step = slowness * 0.055;
      this.x += (mx - cx) * step;
      this.y += (my - cy) * step;
      // Drain velocity so repulsion re-entry feels clean
      this.vx *= 0.80;
      this.vy *= 0.80;
    } else if (dist < REPEL_RADIUS) {
      // Fast approach: repulsion
      const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3.2) {
      this.vx = (this.vx / speed) * 3.2;
      this.vy = (this.vy / speed) * 3.2;
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

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }
}

const startPos = (() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  return [
    { x: vw * 0.08, y: vh * 0.10 },
    { x: vw * 0.52, y: vh * 0.44 },
    { x: vw * 0.22, y: vh * 0.68 },
  ];
})();

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
    this.rpm   += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;

    const VW   = window.innerWidth;
    const VH   = window.innerHeight;
    const PAD  = 18;

    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (mouseSpeed < SLOW_THRESHOLD && dist < ATTRACT_RADIUS) {
      const slowness = 1 - mouseSpeed / SLOW_THRESHOLD;
      const step = slowness * 0.055;
      this.x += (mx - cx) * step;
      this.y += (my - cy) * step;
      this.vx *= 0.80;
      this.vy *= 0.80;
    } else if (dist < REPEL_RADIUS) {
      const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.45;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3.2) {
      this.vx = (this.vx / speed) * 3.2;
      this.vy = (this.vy / speed) * 3.2;
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


let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const delta = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += delta * 0.035; });
  record.vy += delta * 0.035;
  lastScrollY = window.scrollY;
}, { passive: true });


(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  if (recordEl.classList.contains('visible')) {
    record.tick(mouseX, mouseY, now);
  }
  requestAnimationFrame(loop);
})(performance.now());


loadFromHash();


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
