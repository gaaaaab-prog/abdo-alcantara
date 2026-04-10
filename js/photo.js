// =============================================
// photo.js — Floating images, filters, photo page
// =============================================
(function() {
'use strict';

// ── PHOTO CONSTANTS ─────────────────────────
const PHOTO_FRICTION   = 0.9917;
const PHOTO_DRIFT      = 0.00184;
const PHOTO_MAX_SPEED  = 2.3;
const THUMB_HEIGHT     = 72;
const ENLARGE_RATIO    = 0.65;
const COLLISION_BUFFER = 20;
const COLLISION_FORCE  = 0.03;
const PHOTO_CONFIG     = { friction: PHOTO_FRICTION, drift: PHOTO_DRIFT, maxSpeed: PHOTO_MAX_SPEED, centerY: 0.42 };

// ── PHOTO PLACEHOLDERS ──────────────────────
const PHOTO_PLACEHOLDERS = [
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-1.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-1.jpg', type: 'digital', ar: 0.667 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-2.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-2.jpg', type: 'digital', ar: 0.667 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-3.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-3.jpg', type: 'digital', ar: 1.778 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-4.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-4.jpg', type: 'digital', ar: 0.680 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-5.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-5.jpg', type: 'digital', ar: 0.569 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-6.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-6.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-7.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-7.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-8.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-8.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/thumb/digital/rhr1talks_web/altman-9.jpg', full: 'images/photo/full/digital/rhr1talks_web/altman-9.jpg', type: 'digital', ar: 1.500 },
  { src: 'images/photo/thumb/analog/2023_rhr_bw35/zoetrope_web-1.jpg', full: 'images/photo/full/analog/2023_rhr_bw35/zoetrope_web-1.jpg', type: 'analog', ar: 1.508 },
  { src: 'images/photo/thumb/analog/2023_rhr_bw35/zoetrope_web-2.jpg', full: 'images/photo/full/analog/2023_rhr_bw35/zoetrope_web-2.jpg', type: 'analog', ar: 1.508 },
  { src: 'images/photo/thumb/analog/2023_rhr_bw35/zoetrope_web-3.jpg', full: 'images/photo/full/analog/2023_rhr_bw35/zoetrope_web-3.jpg', type: 'analog', ar: 1.508 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-1.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-1.jpg', type: 'analog', ar: 0.805 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-2.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-2.jpg', type: 'analog', ar: 0.810 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-3.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-3.jpg', type: 'analog', ar: 0.811 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-4.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-4.jpg', type: 'analog', ar: 1.245 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-5.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-5.jpg', type: 'analog', ar: 1.244 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-6.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-6.jpg', type: 'analog', ar: 1.244 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-7.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-7.jpg', type: 'analog', ar: 1.245 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-8.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-8.jpg', type: 'analog', ar: 1.244 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-9.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-9.jpg', type: 'analog', ar: 1.249 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-10.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-10.jpg', type: 'analog', ar: 0.803 },
  { src: 'images/photo/thumb/analog/2025_bm_polaroids/WEB_bm_polaroid-11.jpg', full: 'images/photo/full/analog/2025_bm_polaroids/WEB_bm_polaroid-11.jpg', type: 'analog', ar: 1.247 },
];

// ── CACHED DOM REFS ─────────────────────────
const photoContainer = document.getElementById('photo-float-container');
// Cache tab group references (Q-13)
const photoTabGroups = document.querySelectorAll('.photo-tab-group');
const photoTabs      = document.querySelectorAll('.photo-tab');

// ── FLOATING IMAGE ──────────────────────────
class FloatingImage {
  constructor(el, x, y, angle, fullSrc) {
    this.el = el; this.x = x; this.y = y;
    this.ar = parseFloat(el.dataset.ar) || 1;
    this.fullSrc = fullSrc;
    this.h = THUMB_HEIGHT;
    this.w = Math.round(THUMB_HEIGHT * this.ar);
    el.style.width = `${this.w}px`;
    el.style.height = `${THUMB_HEIGHT}px`;
    this._driftAngle = angle;
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0005);
    this.vx = Math.cos(angle) * 1.8;
    this.vy = Math.sin(angle) * 1.8;
    this._enlarged = false;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;

    el.addEventListener('click', e => {
      e.stopPropagation();
      if (!this._enlarged) this.toggleEnlarge();
    });
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  toggleEnlarge() {
    if (this._enlarged) {
      this._enlarged = false;
      this.el.classList.remove('enlarged');
      this.el.style.left = ''; this.el.style.top = '';
      this.el.style.transition = 'none';
      this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
      photoContainer.classList.remove('has-enlarged');
      this.h = THUMB_HEIGHT;
      this.w = Math.round(THUMB_HEIGHT * this.ar);
      this.el.style.width = `${this.w}px`;
      this.el.style.height = `${THUMB_HEIGHT}px`;
      // Swap back to thumb
      const img = this.el.querySelector('img');
      if (img && img.dataset.thumb) img.src = img.dataset.thumb;
      const _el = this.el;
      requestAnimationFrame(() => { _el.style.transition = ''; });
    } else {
      // Un-enlarge all others first
      window.floatingImages.forEach(fi => {
        if (fi._enlarged) {
          fi._enlarged = false;
          fi.el.style.transition = 'none';
          fi.el.classList.remove('enlarged');
          fi.w = Math.round(THUMB_HEIGHT * fi.ar);
          fi.h = THUMB_HEIGHT;
          fi.el.style.width = `${fi.w}px`;
          fi.el.style.height = `${THUMB_HEIGHT}px`;
          const img = fi.el.querySelector('img');
          if (img && img.dataset.thumb) img.src = img.dataset.thumb;
          requestAnimationFrame(() => { fi.el.style.transition = ''; });
        }
      });

      this._enlarged = true;
      this.el.style.transition = 'none';
      this.el.classList.add('enlarged');

      // Swap to full-res image
      const img = this.el.querySelector('img');
      if (img && this.fullSrc) {
        img.dataset.thumb = img.src;
        img.src = this.fullSrc;
      }

      const maxW = window.innerWidth * ENLARGE_RATIO;
      const maxH = window.innerHeight * ENLARGE_RATIO;
      let ew, eh;
      if (this.ar >= maxW / maxH) { ew = maxW; eh = ew / this.ar; }
      else { eh = maxH; ew = eh * this.ar; }

      this.el.style.width  = `${Math.round(ew)}px`;
      this.el.style.height = `${Math.round(eh)}px`;
      this.el.style.left   = `${Math.round((window.innerWidth - ew) / 2)}px`;
      this.el.style.top    = `${Math.round((window.innerHeight - eh) / 2)}px`;
      this.el.style.transform = 'none';
      photoContainer.classList.add('has-enlarged');
    }
  }

  tick() {
    if (this._enlarged || this.el.style.opacity === '0') return;
    App.tickEntity(this, PHOTO_CONFIG);
  }
}

// ── PHOTO STATE ─────────────────────────────
window.floatingImages = [];
let collisionTickRegistered = false;
let collisionFrame = 0;

function getActivePhotoTypes() {
  const types = [];
  photoTabs.forEach(t => { if (t.classList.contains('active')) types.push(t.dataset.photoTab); });
  return types;
}

function updatePhotoFilter() {
  const types = getActivePhotoTypes();
  const activeSubFilters = {};
  photoTabGroups.forEach(group => {
    const tab = group.querySelector('.photo-tab');
    if (tab && tab.classList.contains('active')) {
      const type = tab.dataset.photoTab;
      const subs = group.querySelectorAll('.photo-filter');
      if (subs.length > 0) {
        const active = [];
        group.querySelectorAll('.photo-filter.active').forEach(f => active.push(f.dataset.photoFilter));
        activeSubFilters[type] = active;
      }
    }
  });

  window.floatingImages.forEach(fi => {
    const type = fi.el.dataset.type;
    const filter = fi.el.dataset.filter;
    let match = types.includes(type);
    if (match && activeSubFilters[type]) match = activeSubFilters[type].includes(filter);
    fi.el.style.opacity = match ? '' : '0';
    fi.el.style.pointerEvents = match ? '' : 'none';
  });
}

// ── COLLISION TICK (registered into unified RAF) ──
function photoCollisionTick(now) {
  const imgs = window.floatingImages;
  if (!imgs.length) return;

  const VW = window.innerWidth, VH = window.innerHeight;
  for (let i = 0; i < imgs.length; i++) imgs[i].tick();

  // Collisions every other frame
  if (++collisionFrame & 1) {
    for (let i = 0; i < imgs.length; i++) {
      const a = imgs[i];
      if (a._enlarged || a.el.style.opacity === '0') continue;
      for (let j = i + 1; j < imgs.length; j++) {
        const b = imgs[j];
        if (b._enlarged || b.el.style.opacity === '0') continue;
        const dx = (b.x + b.w * 0.5) - (a.x + a.w * 0.5);
        const dy = (b.y + b.h * 0.5) - (a.y + a.h * 0.5);
        const dSq = dx * dx + dy * dy;
        const md = (a.w + b.w) * 0.5 + COLLISION_BUFFER;
        if (dSq < md * md) {
          const d = Math.sqrt(dSq) || 1;
          const nx = dx / d, ny = dy / d;
          const f = COLLISION_FORCE * (1 - d / md);
          a.vx -= nx * f; a.vy -= ny * f;
          b.vx += nx * f; b.vy += ny * f;
        }
      }
    }
  }
}

// ── INIT / DESTROY ──────────────────────────
window.initPhotoFloat = function() {
  window.destroyPhotoFloat();
  if (!photoContainer) return;

  const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.4;
  const base = Math.random() * Math.PI * 2;
  const count = PHOTO_PLACEHOLDERS.length;

  for (let i = 0; i < count; i++) {
    const ph = PHOTO_PLACEHOLDERS[i];
    const el = document.createElement('div');
    el.className = 'float-img';

    // Parse type/filter from src path
    const parts = ph.src.split('/');
    const pi = parts.indexOf('thumb');
    el.dataset.type = (pi >= 0 && parts[pi + 1]) || ph.type || 'digital';
    if (pi >= 0 && parts[pi + 2]) el.dataset.filter = parts[pi + 2];
    el.dataset.ar = ph.ar || 1;

    el.innerHTML = `<img src="${ph.src}" alt="" style="width:100%;height:100%;border-radius:inherit;" loading="lazy" onerror="this.style.display='none'" />`;
    photoContainer.appendChild(el);

    const angle = base + (i / count) * Math.PI * 2;
    window.floatingImages.push(new FloatingImage(
      el, cx + (Math.random() - 0.5) * 40, cy + (Math.random() - 0.5) * 30, angle, ph.full
    ));
  }

  setTimeout(() => {
    window.floatingImages.forEach(fi => fi.measure());
    updatePhotoFilter();
  }, 100);

  // Register collision tick
  if (!collisionTickRegistered) {
    App.registerTick(photoCollisionTick);
    collisionTickRegistered = true;
  }
};

window.destroyPhotoFloat = function() {
  if (photoContainer) photoContainer.innerHTML = '';
  window.floatingImages = [];
  if (collisionTickRegistered) {
    App.unregisterTick(photoCollisionTick);
    collisionTickRegistered = false;
  }
  collisionFrame = 0;
};

// ── PHOTO TAB TOGGLE + DROPDOWN ─────────────
photoTabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.stopPropagation();
    const isActive = tab.classList.contains('active');
    tab.classList.toggle('active');

    const group = tab.closest('.photo-tab-group');
    if (group) {
      const dd = group.querySelector('.photo-dropdown');
      if (dd) {
        if (isActive) { tab.classList.remove('dropdown-open'); dd.classList.remove('open'); }
        else { tab.classList.add('dropdown-open'); dd.classList.add('open'); }
      }
    }
    updatePhotoFilter();
  });
});

// Sub-filter clicks
document.querySelectorAll('.photo-filter').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.classList.toggle('active');
    updatePhotoFilter();
  });
});

})();
