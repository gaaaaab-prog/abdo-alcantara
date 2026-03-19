// =============================================
// Gabriel Abdo Alcântara — Portfolio
// =============================================

// ── PAGE ROUTING ──────────────────────────
const pages = {
  cv:    document.getElementById('page-cv'),
  film:  document.getElementById('page-film'),
  music: document.getElementById('page-music'),
  'film-photo': document.getElementById('page-film-photo'),
};
const navWords = document.querySelectorAll('.nav-word');

function showPage(key) {
  if (!pages[key]) return;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[key].classList.add('active');
  navWords.forEach(w => {
    const on = w.dataset.page === key;
    w.classList.toggle('active',   on);
    w.classList.toggle('inactive', !on);
  });
  updateRecordVisibility(key);
  history.pushState(null, '', key === 'cv' ? '/' : '#' + key);
  window.scrollTo(0, 0);
  setTimeout(() => floatingWords.forEach(fw => fw.measure()), 50);
}

navWords.forEach(w => {
  w.addEventListener('click',      () => showPage(w.dataset.page));
  w.addEventListener('mouseenter', () => w.classList.remove('inactive'));
});
window.addEventListener('popstate', () => {
  const h = location.hash.replace('#', '');
  showPage(pages[h] ? h : 'cv');
});

// ── MOUSE TRACKING ────────────────────────
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

// ── FILM TABS ────────────────────────────────────
document.querySelectorAll('.film-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.film-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.film-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('tab-' + tab.dataset.filmTab);
    if (target) target.classList.add('active');
  });
});


// ── CV TABS ───────────────────────────────────
document.querySelectorAll('.cv-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cv-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cv-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('cv-tab-' + tab.dataset.cvTab);
    if (target) target.classList.add('active');
  });
});

// ── FLOATING WORD ─────────────────────────
// Words burst outward from near-centre on load (~120° apart), decelerating
// via friction. Drift direction rotates slowly for aimless-looking float.
// Fast mouse swipe pushes; slow approach attracts. Soft edge avoidance +
// inter-word repulsion keep words separated and on-screen.
const FRICTION    = 0.991;  // terminal speed ≈ 0.001/0.006 ≈ 0.17 px/frame
const DRIFT_FORCE = 0.002;  // continuous gentle push along _driftAngle
const MAX_SPEED   = 2.5;    // high cap so the launch burst isn't clipped

class FloatingWord {
  constructor(el, x, y, spreadAngle) {
    this.el = el;
    this.x  = x; this.y  = y;
    this.w  = 0; this.h  = 0;

    // Drift direction aligned with spread angle so initial momentum and
    // long-term force agree — no jarring direction fight during deceleration.
    this._driftAngle      = spreadAngle;
    // Full spin every ~2–6 minutes — change is imperceptible frame-to-frame.
    this._driftAngleSpeed = (Math.random() < 0.5 ? 1 : -1)
                            * (0.0003 + Math.random() * 0.0005);

    // Strong outward launch — words snap apart from centre immediately.
    this.vx = Math.cos(spreadAngle) * 2.0;
    this.vy = Math.sin(spreadAngle) * 2.0;

    el.style.transform = `translate3d(${x}px,${y}px,0)`;
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  tick(mx, my) {
    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    const cx = this.x + this.w * 0.5, cy = this.y + this.h * 0.5;

    // Mouse interaction — slow approach attracts, fast swipe pushes
    const ddx = mx - cx, ddy = my - cy;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
    if (mouseActive && dist < 120) {
      if (mouseSpeed > 8) {
        // Fast swipe — push word away
        const pushF = Math.min(mouseSpeed * 0.004, 0.3);
        this.vx -= (ddx / dist) * pushF;
        this.vy -= (ddy / dist) * pushF;
      } else if (mouseSpeed < 2) {
        // Slow/still — gentle attract
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
    this.vx += (gcx / gd) * 0.0003;
    this.vy += (gcy / gd) * 0.0003;

    // Speed cap + friction
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > MAX_SPEED) { const r = MAX_SPEED / spd; this.vx *= r; this.vy *= r; }
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;

    // Soft edge avoidance — gentle push away from margins
    const MARGIN = 100;
    if (this.x < MARGIN) { this.vx += 0.003 * (MARGIN - this.x) / MARGIN; }
    if (this.x + this.w > VW - MARGIN) { this.vx -= 0.003 * (this.x + this.w - (VW - MARGIN)) / MARGIN; }
    if (this.y < MARGIN) { this.vy += 0.003 * (MARGIN - this.y) / MARGIN; }
    if (this.y + this.h > VH - MARGIN) { this.vy -= 0.003 * (this.y + this.h - (VH - MARGIN)) / MARGIN; }

    // Hard boundary — keep on screen
    if (this.x < PAD) { this.x = PAD; this.vx = Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.2; this._driftAngle = Math.PI - this._driftAngle; }
    if (this.y < PAD) { this.y = PAD; this.vy = Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.2; this._driftAngle = -this._driftAngle; }

    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }
}

// ── RECORD PHYSICS ────────────────────────
// Separate class — the record has its own impulse drift that is much calmer
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

// ── INIT ──────────────────────────────────
// Words burst from near-centre, evenly spread 120° apart (random base angle).
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

// ── RECORD VISIBILITY ─────────────────────
function updateRecordVisibility(key) {
  const on = key === 'music';
  recordEl.classList.toggle('visible', on);
  if (!on) {
    record.lastTime = null;
  }
}

// ── TONEARM ───────────────────────────────
// Rest: arm parallel, needle clear of groove. Play: drops to outer groove then
// sweeps toward the label over the track duration. CSS transition (1.5 s) on
// the SVG element interpolates every angle change — including the slow 2 s
// poll steps during playback — so the sweep reads as perfectly continuous.
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

// Needle stays in groove on pause — tonearm holds position
function pauseTonearm() {
  clearInterval(tonearmInterval);
  tonearmInterval = null;
}

// Track finished naturally — land at label edge, lift back to rest after 2.5s
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

// ── SOUNDCLOUD ────────────────────────────
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

// ── RAF LOOP ──────────────────────────────
// Soft word separation — push scales with actual word sizes so edges never overlap
const REPULSE_FORCE = 0.045;

(function loop(now) {
  floatingWords.forEach(fw => fw.tick(mouseX, mouseY));
  // Soft repulsion — min distance from actual word widths so edges never overlap
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

// ── SCROLL ────────────────────────────────
const floatNav = document.getElementById('float-nav');
const scrollArrow = document.getElementById('scroll-arrow');
window.addEventListener('scroll', () => {
  floatNav.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.15);
  if (scrollArrow) scrollArrow.style.opacity = window.scrollY > 40 ? '0' : '';
}, { passive: true });
if (scrollArrow) {
  scrollArrow.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  });
}

// ── INITIAL ROUTE ─────────────────────────
const _h = location.hash.replace('#', '');
showPage(pages[_h] ? _h : 'cv');

// ── LIGHTBOX ──────────────────────────────
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');

function openLightbox(src) { lbImg.src = src; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeLightbox()   { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }

document.getElementById('lb-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

['film-grid', 'bts-grid'].forEach(id => {
  const g = document.getElementById(id);
  if (g) g.addEventListener('click', e => { const img = e.target.closest('img'); if (img) openLightbox(img.src); });
});
