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

// ── MOUSE ──────────────────────────────────
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

// ── PHYSICS CONSTANTS ──────────────────────
const FRICTION     = 0.991;   // dreamy long decay
const MAX_SPEED    = 1.4;
const ATTRACT_STEP = 0.010;
const REPEL_FORCE  = 0.07;
const DRIFT_FORCE  = 0.0042;  // continuous gentle push (~0.47 px/frame terminal)
const allBodies    = [];

// ── FLOATING WORD ──────────────────────────
class FloatingWord {
  constructor(el, x, y) {
    this.el = el;
    this.x  = x; this.y  = y;
    this.w  = 0; this.h  = 0;

    // Slowly rotating drift direction — produces long arcing curves, no sudden kicks.
    this._driftAngle      = Math.random() * Math.PI * 2;
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1)
                            * (0.0005 + Math.random() * 0.0008);

    // Launch outward so words spread from centre on load.
    this.vx = Math.cos(this._driftAngle) * 0.55;
    this.vy = Math.sin(this._driftAngle) * 0.55;

    // Per-body cooldown: once bumped, ignore further collisions for ~50 frames.
    this._colCooldown = 0;

    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    allBodies.push(this);
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  tick(mx, my) {
    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;
    const dx = cx - mx, dy = cy - my;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Cursor attraction / repulsion
    if (mouseSpeed < SLOW_THRESH && dist < ATTRACT_R) {
      const t = 1 - mouseSpeed / SLOW_THRESH;
      const distFactor = dist / ATTRACT_R;
      const step = t * ATTRACT_STEP * (0.15 + 0.85 * distFactor);
      this.vx += (mx - cx) * step;
      this.vy += (my - cy) * step;
      const damp = 0.88 + 0.10 * distFactor;
      this.vx *= damp; this.vy *= damp;
    } else if (dist < REPEL_R) {
      const f = ((REPEL_R - dist) / REPEL_R) * REPEL_FORCE;
      this.vx += (dx / dist) * f;
      this.vy += (dy / dist) * f;
    }

    // Slowly rotating continuous drift — the core of dreamy motion.
    this._driftAngle += this._driftAngleSpeed;
    if (Math.random() < 0.0008) {
      this._driftAngleSpeed += (Math.random() - 0.5) * 0.0003;
      this._driftAngleSpeed = Math.max(-0.0014, Math.min(0.0014, this._driftAngleSpeed));
    }
    this.vx += Math.cos(this._driftAngle) * DRIFT_FORCE;
    this.vy += Math.sin(this._driftAngle) * DRIFT_FORCE;

    // Collision response — objects may freely overlap, but when they do each
    // gets a light impulse roughly away from the other, with a random flutter
    // so the outcome feels organic rather than mechanical.
    if (this._colCooldown > 0) {
      this._colCooldown--;
    } else {
      for (let i = 0; i < allBodies.length; i++) {
        const o = allBodies[i];
        if (o === this) continue;
        const ddx = cx - (o.x + o.w * 0.5);
        const ddy = cy - (o.y + o.h * 0.5);
        const d   = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        // Trigger when bounding boxes visually touch (half combined widths).
        if (d < (this.w + o.w) * 0.5 + 4) {
          // Opposite direction from the other body, ±~25° random flutter.
          const baseAngle = Math.atan2(ddy, ddx);
          const flutter   = (Math.random() - 0.5) * 0.9;
          const strength  = 0.10 + Math.random() * 0.12;
          this.vx += Math.cos(baseAngle + flutter) * strength;
          this.vy += Math.sin(baseAngle + flutter) * strength;
          this._colCooldown = 50; // ~0.8 s before this body can be bumped again
          break;
        }
      }
    }

    // Speed cap & friction
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > MAX_SPEED) { this.vx = this.vx / spd * MAX_SPEED; this.vy = this.vy / spd * MAX_SPEED; }
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    // Soft boundary: kill momentum and flip drift angle so the word curves away.
    if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }

    this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
  }
}

// ── RECORD PHYSICS ─────────────────────────
const REC_FRICTION         = 0.960;
const REC_MAX_SPEED        = 0.45;
const REC_IMPULSE_MIN      = 0.04;
const REC_IMPULSE_RANGE    = 0.06;
const REC_INTERVAL_MIN     = 280;
const REC_INTERVAL_RANGE   = 360;
const REC_POST_DRAG_FRAMES = 300;

class RecordPhysics extends FloatingWord {
  constructor(el, x, y) {
    super(el, x, y);
    this.vinylEl   = el.querySelector('.record-vinyl');
    this.angle     = 0;
    this.rpm       = 0;
    this.targetRpm = 0;
    this._playing  = false;
    this.lastTime  = null;
    this.dragging  = false;
    this.dragOffX  = 0;
    this.dragOffY  = 0;
    this._didDrag  = false;
    this._postDragCooldown = REC_POST_DRAG_FRAMES;
    this._driftInterval    = REC_INTERVAL_MIN + Math.floor(Math.random() * REC_INTERVAL_RANGE);
    this._driftFrame       = 0;

    el.addEventListener('mouseenter', () => { if (!this.dragging) this.targetRpm = 4; });
    el.addEventListener('mouseleave', () => { if (!this.dragging) this.targetRpm = this._playing ? 33 : 0; });

    el.addEventListener('mousedown', e => { e.preventDefault(); this._startDrag(e.clientX, e.clientY); });
    document.addEventListener('mousemove', e => { if (this.dragging) this._moveDrag(e.clientX, e.clientY); });
    document.addEventListener('mouseup', () => this._endDrag());

    el.addEventListener('touchstart', e => {
      const t = e.touches[0]; this._startDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (this.dragging) { const t = e.touches[0]; this._moveDrag(t.clientX, t.clientY); }
    }, { passive: true });
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
    this.dragging = false;
    this.el.classList.remove('dragging');
    this.vx = 0; this.vy = 0;
    this._postDragCooldown = REC_POST_DRAG_FRAMES;
  }

  setPlaying(on) { this._playing = on; this.targetRpm = on ? 33 : 0; }

  tick(mx, my, now) {
    const dt = this.lastTime !== null ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    this.rpm   += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;

    if (!this.dragging) {
      const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;

      if (this._postDragCooldown > 0) this._postDragCooldown--;

      this._driftFrame++;
      if (this._driftFrame >= this._driftInterval && this._postDragCooldown === 0) {
        this._driftFrame    = 0;
        this._driftInterval = REC_INTERVAL_MIN + Math.floor(Math.random() * REC_INTERVAL_RANGE);
        const a = Math.random() * Math.PI * 2;
        const s = REC_IMPULSE_MIN + Math.random() * REC_IMPULSE_RANGE;
        this.vx += Math.cos(a) * s; this.vy += Math.sin(a) * s;
      }

      const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (spd > REC_MAX_SPEED) { this.vx = this.vx / spd * REC_MAX_SPEED; this.vy = this.vy / spd * REC_MAX_SPEED; }
      this.vx *= REC_FRICTION; this.vy *= REC_FRICTION;

      this.x += this.vx; this.y += this.vy;

      if (this.x < PAD)               { this.x = PAD;               this.vx =  Math.abs(this.vx) * 0.3; }
      if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.3; }
      if (this.y < PAD)               { this.y = PAD;               this.vy =  Math.abs(this.vy) * 0.3; }
      if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.3; }

      this.el.style.transform = 'translate3d(' + this.x + 'px,' + this.y + 'px,0)';
    }

    if (this.vinylEl) this.vinylEl.style.transform = 'rotate(' + this.angle + 'deg)';
  }
}

// ── INIT ───────────────────────────────────
// All words start near the screen centre and drift outward.
const startPos = (() => {
  const cx = window.innerWidth  * 0.5;
  const cy = window.innerHeight * 0.5;
  return Array.from({ length: 3 }, () => ({
    x: cx + (Math.random() - 0.5) * 80,
    y: cy + (Math.random() - 0.5) * 60
  }));
})();

const floatingWords = Array.from(navWords).map((el, i) =>
  new FloatingWord(el, startPos[i].x, startPos[i].y)
);

const recordEl  = document.getElementById('record');
const tonearmEl = document.getElementById('tonearm');
const record    = new RecordPhysics(recordEl, window.innerWidth * 0.55, window.innerHeight * 0.35);

document.fonts.ready.then(() => {
  floatingWords.forEach(fw => fw.measure());
  record.measure();
});
window.addEventListener('resize', () => {
  floatingWords.forEach(fw => fw.measure());
  record.measure();
});

// ── VISIBILITY ─────────────────────────────
function updateRecordVisibility(key) {
  const on = key === 'music';
  recordEl.classList.toggle('visible', on);
  if (!on) {
    record.lastTime = null;
    if (scWidget && scPlaying) scWidget.pause();
  }
}

// ── SOUNDCLOUD ─────────────────────────────
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
    scWidget.getCurrentSound(s => {
      scTrackName.textContent = (s ? s.title : SC_TRACK_TITLES[scTrackIdx]) + ' - (soundcloud)';
    });
    syncPlayer();
  });

  scWidget.bind(SC.Widget.Events.PAUSE, () => { scPlaying = false; syncPlayer(); });

  scWidget.bind(SC.Widget.Events.FINISH, () => {
    scPlaying = false; syncPlayer();
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
    show_user: false, show_reposts: false, show_teaser: false, visual: true
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
  if (ip2) ip2.style.display = scPlaying ? ''     : 'none';
  record.setPlaying(scPlaying);
  tonearmEl.classList.toggle('playing', scPlaying);
}

recordEl.addEventListener('click', () => {
  if (record._didDrag) { record._didDrag = false; return; }
  scPlayerEl.classList.add('visible');
  scTrackName.textContent = SC_TRACK_TITLES[scTrackIdx] + ' - (soundcloud)';
  togglePlay();
});

scCloseBtn.addEventListener('click', e => { e.stopPropagation(); scPlayerEl.classList.remove('visible'); });

tonearmEl.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPlayBtn.addEventListener('click',  e => { e.stopPropagation(); togglePlay(); });
scPrevBtn.addEventListener('click',  e => { e.stopPropagation(); loadTrack(scTrackIdx - 1, scPlaying); });
scNextBtn.addEventListener('click',  e => { e.stopPropagation(); loadTrack(scTrackIdx + 1, scPlaying); });

// ── SCROLL ─────────────────────────────────
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const d = window.scrollY - lastScrollY;
  floatingWords.forEach(fw => { fw.vy += d * 0.004; });
  record.vy += d * 0.004;
  lastScrollY = window.scrollY;
}, { passive: true });

// ── LOOP ───────────────────────────────────
(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  if (recordEl.classList.contains('visible')) record.tick(mouseX, mouseY, now);
  requestAnimationFrame(loop);
})(performance.now());

loadFromHash();

// ── LIGHTBOX ───────────────────────────────
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
