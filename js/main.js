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

// ── MOUSE ────────────────────────────────────
let mouseX = -9999, mouseY = -9999, mouseSpeed = 0;
const SLOW_THRESH = 4;
const ATTRACT_R   = 130;
const REPEL_R     = 180;

document.addEventListener('mousemove', e => {
  const ddx = e.clientX - mouseX, ddy = e.clientY - mouseY;
  mouseX = e.clientX; mouseY = e.clientY;
  mouseSpeed = mouseSpeed * 0.65 + Math.sqrt(ddx * ddx + ddy * ddy) * 0.35;
});
document.addEventListener('touchmove', e => {
  const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseSpeed = 0;
}, { passive: true });
document.addEventListener('touchend', () => { mouseX = -9999; mouseY = -9999; mouseSpeed = 0; });

// ── PHYSICS CONSTANTS ────────────────────────
const DRIFT_SPEED   = 0.15;
const FRICTION      = 0.984;   // slower decay → longer, farther drifts
const MAX_SPEED     = 2.2;
const ATTRACT_STEP  = 0.014;
const REPEL_FORCE   = 0.10;
const JITTER        = 0.006;   // tiny baseline tremor when nearly still
const COLLISION_PAD = 24;
const allBodies     = [];

// ── FLOATING WORD ────────────────────────────
class FloatingWord {
  constructor(el, x, y) {
    this.el = el; this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * DRIFT_SPEED;
    this.vy = (Math.random() - 0.5) * DRIFT_SPEED;
    this.w = 0; this.h = 0;
    // Each element gets a staggered random-walk timer so they don't all
    // lurch in the same direction at the same moment.
    this._driftFrame    = Math.floor(Math.random() * 200);
    this._driftInterval = 160 + Math.floor(Math.random() * 220); // ~2.7–6.3 s at 60 fps
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    allBodies.push(this);
  }
  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  tick(mx, my) {
    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;
    const dx = cx - mx, dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Cursor attraction / repulsion (unchanged feel from before)
    if (mouseSpeed < SLOW_THRESH && dist < ATTRACT_R) {
      const t = 1 - mouseSpeed / SLOW_THRESH;
      const distFactor = dist / ATTRACT_R;
      const step = t * ATTRACT_STEP * (0.15 + 0.85 * distFactor);
      this.vx += (mx - cx) * step;
      this.vy += (my - cy) * step;
      const damp = 0.82 + 0.15 * distFactor;
      this.vx *= damp;
      this.vy *= damp;
    } else if (dist < REPEL_R) {
      const f = ((REPEL_R - dist) / REPEL_R) * REPEL_FORCE;
      this.vx += (dx / dist) * f;
      this.vy += (dy / dist) * f;
    }

    // Periodic random-walk impulse — the main driver of organic drift.
    // Each element kicks itself in a new random direction every few seconds,
    // giving sustained motion that fades naturally via friction.
    this._driftFrame++;
    if (this._driftFrame >= this._driftInterval) {
      this._driftFrame    = 0;
      this._driftInterval = 160 + Math.floor(Math.random() * 220);
      const angle    = Math.random() * Math.PI * 2;
      const strength = 0.28 + Math.random() * 0.32; // 0.28–0.60 → ~19–40 px total glide
      this.vx += Math.cos(angle) * strength;
      this.vy += Math.sin(angle) * strength;
    }

    // Collision avoidance
    for (let i = 0; i < allBodies.length; i++) {
      const o = allBodies[i]; if (o === this) continue;
      const ddx = cx - (o.x + o.w * 0.5);
      const ddy = cy - (o.y + o.h * 0.5);
      const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      const minD = (this.w + o.w) * 0.5 + COLLISION_PAD;
      if (d < minD) {
        const push = (minD - d) / minD * 0.08;
        this.vx += (ddx / d) * push;
        this.vy += (ddy / d) * push;
      }
    }

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > MAX_SPEED) { this.vx = this.vx / spd * MAX_SPEED; this.vy = this.vy / spd * MAX_SPEED; }
    this.vx *= FRICTION; this.vy *= FRICTION;
    // Tiny baseline tremor so elements never freeze completely
    if (spd < 0.04) {
      this.vx += (Math.random() - 0.5) * JITTER;
      this.vy += (Math.random() - 0.5) * JITTER;
    }

    this.x += this.vx; this.y += this.vy;
    if (this.x < PAD) { this.x = PAD; this.vx = Math.abs(this.vx) * 0.5; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y < PAD) { this.y = PAD; this.vy = Math.abs(this.vy) * 0.5; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.5; }

    // Sub-pixel float values — smooth continuous motion.
    // (CSS will-change / backface-visibility removed from .nav-word so the
    //  browser rasterises text on the main thread = sharp at any position.)
    this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
  }
}

// ── RECORD PHYSICS ───────────────────────────
class RecordPhysics extends FloatingWord {
  constructor(el, x, y) {
    super(el, x, y);
    this.vinylEl = el.querySelector('.record-vinyl');
    this.angle = 0; this.rpm = 0; this.targetRpm = 0;
    this._playing = false; this.lastTime = null;
    this.dragging = false; this.dragOffX = 0; this.dragOffY = 0;
    this._didDrag = false;
    el.addEventListener('mouseenter', () => { if (!this.dragging) this.targetRpm = 4; });
    el.addEventListener('mouseleave', () => { if (!this.dragging) this.targetRpm = this._playing ? 33 : 0; });
    el.addEventListener('mousedown', e => { e.preventDefault(); this._startDrag(e.clientX, e.clientY); });
    document.addEventListener('mousemove', e => { if (this.dragging) this._moveDrag(e.clientX, e.clientY); });
    document.addEventListener('mouseup', () => this._endDrag());
    el.addEventListener('touchstart', e => { const t = e.touches[0]; this._startDrag(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener('touchmove', e => { if (this.dragging) { const t = e.touches[0]; this._moveDrag(t.clientX, t.clientY); } }, { passive: true });
    document.addEventListener('touchend', () => this._endDrag());
  }
  _startDrag(px, py) {
    this.dragging = true; this._didDrag = false;
    this.dragOffX = px - this.x; this.dragOffY = py - this.y;
    this.vx = 0; this.vy = 0;
    this.el.classList.add('dragging');
  }
  _moveDrag(px, py) {
    this._didDrag = true;
    this.x = px - this.dragOffX; this.y = py - this.dragOffY;
    this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
  }
  _endDrag() {
    if (!this.dragging) return;
    this.dragging = false; this.el.classList.remove('dragging');
  }
  setPlaying(on) { this._playing = on; this.targetRpm = on ? 33 : 0; }
  tick(mx, my, now) {
    const dt = this.lastTime !== null ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    this.rpm += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;
    if (!this.dragging) { super.tick(mx, my); }
    if (this.vinylEl) this.vinylEl.style.transform = 'rotate(' + this.angle + 'deg)';
  }
}

// ── INIT ─────────────────────────────────────
const startPos = (() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  return [
    { x: vw * 0.08, y: vh * 0.10 },
    { x: vw * 0.52, y: vh * 0.44 },
    { x: vw * 0.22, y: vh * 0.68 }
  ];
})();

const floatingWords = Array.from(navWords).map((el, i) =>
  new FloatingWord(el, startPos[i].x, startPos[i].y)
);

const recordEl  = document.getElementById('record');
const tonearmEl = document.getElementById('tonearm');
const record    = new RecordPhysics(recordEl, window.innerWidth * 0.55, window.innerHeight * 0.35);

document.fonts.ready.then(() => {
  floatingWords.forEach(fw => fw.measure()); record.measure();
});
window.addEventListener('resize', () => {
  floatingWords.forEach(fw => fw.measure()); record.measure();
});

// ── VISIBILITY ───────────────────────────────
function updateRecordVisibility(key) {
  const on = key === 'music';
  recordEl.classList.toggle('visible', on);
  if (!on) {
    record.lastTime = null;
    if (scWidget && scPlaying) scWidget.pause();
  }
}

// ── SOUNDCLOUD ───────────────────────────────
const SC_TRACKS = [
  'https://soundcloud.com/gabd0/5-el-cronopio',
  'https://soundcloud.com/gabd0/4-huella',
  'https://soundcloud.com/gabd0/c3331b42-8ae1-4b01-acf1-cea184ad11f5',
  'https://soundcloud.com/gabd0/gabdo23-wav',
  'https://soundcloud.com/gabd0/gabdo1-vinyl-mix'
];
const SC_TRACK_TITLES = ['5', '4 - huella', '3 - a love letter', '2', '1'];

let scWidget = null, scReady = false, scPlaying = false, scPendingPlay = false;
let scTrackIdx = 0;

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
    // Player visibility is controlled only by record click — don't auto-show here.
    scWidget.getCurrentSound(s => {
      scTrackName.textContent = (s ? s.title : SC_TRACK_TITLES[scTrackIdx]) + ' - (soundcloud)';
    });
    syncPlayer();
  });

  scWidget.bind(SC.Widget.Events.PAUSE, () => { scPlaying = false; syncPlayer(); });

  scWidget.bind(SC.Widget.Events.FINISH, () => {
    scPlaying = false;
    syncPlayer();
    loadTrack((scTrackIdx + 1) % SC_TRACKS.length, true);
  });
}

function loadTrack(idx, autoPlay) {
  if (!scWidget) return;
  scTrackIdx = ((idx % SC_TRACKS.length) + SC_TRACKS.length) % SC_TRACKS.length;
  scReady = false;
  scPlaying = false;
  if (autoPlay) scPendingPlay = true;
  scTrackName.textContent = SC_TRACK_TITLES[scTrackIdx] + ' - (soundcloud)';
  scWidget.load(SC_TRACKS[scTrackIdx], {
    auto_play: false,
    hide_related: true,
    show_comments: false,
    show_user: false,
    show_reposts: false,
    show_teaser: false,
    visual: true
  });
}

function togglePlay() {
  if (!scWidget) return;
  if (!scReady) { scPendingPlay = !scPendingPlay; return; }
  scPlaying ? scWidget.pause() : scWidget.play();
}

function syncPlayer() {
  const ip  = scPlayBtn.querySelector('.icon-play');
  const ip2 = scPlayBtn.querySelector('.icon-pause');
  if (ip)  ip.style.display  = scPlaying ? 'none' : '';
  if (ip2) ip2.style.display = scPlaying ? '' : 'none';
  record.setPlaying(scPlaying);
  tonearmEl.classList.toggle('playing', scPlaying);
}

// Record click: reveal player + toggle play
recordEl.addEventListener('click', () => {
  if (record._didDrag) { record._didDrag = false; return; }
  scPlayerEl.classList.add('visible');
  scTrackName.textContent = SC_TRACK_TITLES[scTrackIdx] + ' - (soundcloud)';
  togglePlay();
});

// X closes the player window (playback continues uninterrupted)
scCloseBtn.addEventListener('click', e => {
  e.stopPropagation();
  scPlayerEl.classList.remove('visible');
});

tonearmEl.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPlayBtn.addEventListener('click',  e => { e.stopPropagation(); togglePlay(); });

scPrevBtn.addEventListener('click', e => {
  e.stopPropagation();
  loadTrack(scTrackIdx - 1, scPlaying);
});
scNextBtn.addEventListener('click', e => {
  e.stopPropagation();
  loadTrack(scTrackIdx + 1, scPlaying);
});

// ── SCROLL ───────────────────────────────────
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const d = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += d * 0.008; });
  record.vy += d * 0.008;
  lastScrollY = window.scrollY;
}, { passive: true });

// ── LOOP ─────────────────────────────────────
(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  if (recordEl.classList.contains('visible')) record.tick(mouseX, mouseY, now);
  requestAnimationFrame(loop);
})(performance.now());

loadFromHash();

// ── LIGHTBOX ─────────────────────────────────
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');

function openLightbox(src)  { lbImg.src = src; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLightbox()    { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }

document.getElementById('lb-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

['film-grid','bts-grid'].forEach(id => {
  const g = document.getElementById(id);
  if (g) g.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (img) openLightbox(img.src);
  });
});
