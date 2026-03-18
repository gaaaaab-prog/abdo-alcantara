// =============================================
// Gabriel Abdo Alcântara — Portfolio
// Navigation + Floating Word Physics
// =============================================

// PAGE NAVIGATION
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

// FLOATING WORD PHYSICS
// Each word drifts in zero gravity, bounces off edges,
// repels from the cursor, and reacts to scroll.

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
    const REPEL = 200;

    // Cursor repulsion
    const cx = this.x + this.w * 0.5;
    const cy = this.y + this.h * 0.5;
    const dx = cx - mx;
    const dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (dist < REPEL) {
      const force = ((REPEL - dist) / REPEL) * 0.45;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    // Speed cap
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3.2) {
      this.vx = (this.vx / speed) * 3.2;
      this.vy = (this.vy / speed) * 3.2;
    }

    // Friction
    this.vx *= 0.984;
    this.vy *= 0.984;

    // Keep drifting if nearly still
    if (speed < 0.22) {
      this.vx += (Math.random() - 0.5) * 0.07;
      this.vy += (Math.random() - 0.5) * 0.07;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Bounce off viewport edges
    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.75; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.75; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.75; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.75; }

    this.el.style.left = this.x + 'px';
    this.el.style.top  = this.y + 'px';
  }
}

// Spread initial positions
const vw = window.innerWidth;
const vh = window.innerHeight;
const startPos = [
  { x: vw * 0.08,  y: vh * 0.10 },
  { x: vw * 0.52,  y: vh * 0.44 },
  { x: vw * 0.22,  y: vh * 0.68 },
];

const floatingWords = Array.from(navWords).map((el, i) =>
  new FloatingWord(el, startPos[i].x, startPos[i].y)
);

document.fonts.ready.then(() => floatingWords.forEach(fw => fw.measure()));
window.addEventListener('resize', () => floatingWords.forEach(fw => fw.measure()));

// Mouse tracking
let mouseX = -9999, mouseY = -9999;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

// Touch tracking (mobile)
document.addEventListener('touchmove', e => {
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = -9999; mouseY = -9999; });

// Scroll gives words a nudge
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const delta = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += delta * 0.035; });
  lastScrollY = window.scrollY;
}, { passive: true });

// Animation loop
(function loop() {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  requestAnimationFrame(loop);
})();

// LIGHTBOX
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

// Delegate lightbox clicks on grids (works as images are added later)
['film-grid', 'bts-grid'].forEach(id => {
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) openLightbox(img.src);
  });
});
