// =============================================
// music.js — Record physics, tonearm, SoundCloud
// =============================================

// ── RECORD PHYSICS ──────────────────────────
const RECORD_MAX_SPEED = 0.45;
const RECORD_FRICTION  = 0.960;
const RECORD_DRIFT_MIN = 300;
const RECORD_DRIFT_VAR = 360;
const RECORD_COOLDOWN  = 300;

class RecordPhysics {
  constructor(el, x, y) {
    this.el = el; this.x = x; this.y = y;
    this.vx = 0; this.vy = 0; this.w = 0; this.h = 0;
    this.vinylEl = el.querySelector('.record-vinyl');
    this.angle = 0; this.rpm = 0; this.targetRpm = 0;
    this._playing = false; this.lastTime = null;
    this.dragging = false; this.dragOffX = 0; this.dragOffY = 0;
    this._didDrag = false; this._cooldown = RECORD_COOLDOWN;
    this._driftCount = 0;
    this._driftTimer = RECORD_DRIFT_MIN + Math.floor(Math.random() * RECORD_DRIFT_VAR);

    el.addEventListener('mouseenter', () => { if (!this.dragging) this.targetRpm = 4; });
    el.addEventListener('mouseleave', () => { if (!this.dragging) this.targetRpm = this._playing ? 33 : 0; });

    // Scoped drag listeners (P-5): added on start, removed on end
    this._onMouseMove = e => this._moveDrag(e.clientX, e.clientY);
    this._onMouseUp   = () => this._endDrag();
    this._onTouchMove  = e => { const t = e.touches[0]; this._moveDrag(t.clientX, t.clientY); };
    this._onTouchEnd   = () => this._endDrag();

    el.addEventListener('mousedown', e => { e.preventDefault(); this._startDrag(e.clientX, e.clientY); });
    el.addEventListener('touchstart', e => { const t = e.touches[0]; this._startDrag(t.clientX, t.clientY); }, { passive: true });
  }

  measure() { this.w = this.el.offsetWidth; this.h = this.el.offsetHeight; }

  _startDrag(px, py) {
    this.dragging = true; this._didDrag = false;
    this.dragOffX = px - this.x; this.dragOffY = py - this.y;
    this.vx = 0; this.vy = 0;
    this.el.classList.add('dragging');
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    document.addEventListener('touchend', this._onTouchEnd);
  }

  _moveDrag(px, py) {
    this._didDrag = true;
    this.x = px - this.dragOffX; this.y = py - this.dragOffY;
    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }

  _endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    this.el.classList.remove('dragging');
    this.vx = 0; this.vy = 0; this._cooldown = RECORD_COOLDOWN;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
  }

  setPlaying(on) { this._playing = on; this.targetRpm = on ? 33 : 0; }

  tick(now) {
    const dt = this.lastTime ? (now - this.lastTime) / 1000 : 0;
    this.lastTime = now;
    this.rpm += (this.targetRpm - this.rpm) * 0.03;
    this.angle += this.rpm * 6 * dt;
    if (this.vinylEl) this.vinylEl.style.transform = `rotate(${this.angle}deg)`;
    if (this.dragging) return;

    const VW = window.innerWidth, VH = window.innerHeight, PAD = 18;
    if (this._cooldown > 0) { this._cooldown--; }
    else {
      this._driftCount++;
      if (this._driftCount >= this._driftTimer) {
        this._driftCount = 0;
        this._driftTimer = RECORD_DRIFT_MIN + Math.floor(Math.random() * RECORD_DRIFT_VAR);
        const a = Math.random() * Math.PI * 2;
        this.vx += Math.cos(a) * (0.04 + Math.random() * 0.06);
        this.vy += Math.sin(a) * (0.04 + Math.random() * 0.06);
      }
    }

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > RECORD_MAX_SPEED) { const r = RECORD_MAX_SPEED / spd; this.vx *= r; this.vy *= r; }
    this.vx *= RECORD_FRICTION; this.vy *= RECORD_FRICTION;
    this.x += this.vx; this.y += this.vy;

    if (this.x < PAD) { this.x = PAD; this.vx = Math.abs(this.vx) * 0.3; }
    if (this.x + this.w > VW - PAD) { this.x = VW - this.w - PAD; this.vx = -Math.abs(this.vx) * 0.3; }
    if (this.y < PAD) { this.y = PAD; this.vy = Math.abs(this.vy) * 0.3; }
    if (this.y + this.h > VH - PAD) { this.y = VH - this.h - PAD; this.vy = -Math.abs(this.vy) * 0.3; }
    this.el.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
  }
}

// ── INIT RECORD ─────────────────────────────
const recordEl = App.recordEl;
const tonearmEl = document.getElementById('tonearm');
const record = new RecordPhysics(recordEl, window.innerWidth * 0.55, window.innerHeight * 0.35);

document.fonts.ready.then(() => record.measure());
window.addEventListener('resize', () => record.measure());

// Visibility resume
document.addEventListener('visibilitychange', () => { if (!document.hidden) record.lastTime = null; });

// Register record tick into unified loop
App.registerTick(function recordTick(now) {
  if (App.recordVisible) record.tick(now);
});

// ── TONEARM ─────────────────────────────────
const TONEARM_REST  = 55;
const TONEARM_OUTER = 47;
const TONEARM_INNER = 3;
const TONEARM_POLL  = 2000;

const tonearmSvg   = tonearmEl.querySelector('svg');
const scProgressBar = document.getElementById('sc-progress-bar');
const scElapsedEl   = document.getElementById('sc-elapsed');
let tonearmInterval = null, tonearmFinishTimer = null, scDuration = 0;

function setTonearmAngle(deg) { tonearmSvg.style.transform = `rotate(${deg}deg)`; }

function startTonearmSweep(isResume) {
  clearInterval(tonearmInterval);
  clearTimeout(tonearmFinishTimer);
  if (!isResume) {
    scWidget.getCurrentSound(s => { scDuration = s && s.duration ? s.duration : 0; setTonearmAngle(TONEARM_OUTER); });
  }
  tonearmInterval = setInterval(() => {
    if (!scDuration) return;
    scWidget.getPosition(pos => {
      const pct = Math.min(pos / scDuration, 1);
      setTonearmAngle(TONEARM_OUTER + (TONEARM_INNER - TONEARM_OUTER) * pct);
      if (scProgressBar) scProgressBar.style.width = `${(pct * 100).toFixed(1)}%`;
      if (scElapsedEl) {
        const s = Math.floor(pos / 1000);
        scElapsedEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      }
    });
  }, TONEARM_POLL);
}

function pauseTonearm() { clearInterval(tonearmInterval); tonearmInterval = null; }

function finishTonearm() {
  clearInterval(tonearmInterval); tonearmInterval = null; scDuration = 0;
  setTonearmAngle(TONEARM_INNER);
  tonearmFinishTimer = setTimeout(() => setTonearmAngle(TONEARM_REST), 2500);
}

function stopTonearmSweep() {
  clearInterval(tonearmInterval); clearTimeout(tonearmFinishTimer);
  tonearmInterval = null; scDuration = 0;
  setTonearmAngle(TONEARM_REST);
  if (scProgressBar) scProgressBar.style.width = '0%';
  if (scElapsedEl) scElapsedEl.textContent = '0:00';
}

// ── SOUNDCLOUD ──────────────────────────────
const SC_TRACKS = [
  { url: 'https://soundcloud.com/gabd0/5-el-cronopio',                          title: '5' },
  { url: 'https://soundcloud.com/gabd0/4-huella',                               title: '4 - huella' },
  { url: 'https://soundcloud.com/gabd0/c3331b42-8ae1-4b01-acf1-cea184ad11f5',   title: '3 - a love letter' },
  { url: 'https://soundcloud.com/gabd0/gabdo23-wav',                             title: '2' },
  { url: 'https://soundcloud.com/gabd0/gabdo1-vinyl-mix',                        title: '1' },
];

let scWidget = null, scReady = false, scPlaying = false, scPendingPlay = false, scTrackIdx = 0;
let scPauseTimer = null, scInitialized = false;

const scPlayerEl  = document.getElementById('sc-player');
const scTrackName = document.getElementById('sc-track-name');
const scPlayBtn   = document.getElementById('sc-play');
const scPrevBtn   = document.getElementById('sc-prev');
const scNextBtn   = document.getElementById('sc-next');
const scCloseBtn  = document.getElementById('sc-close');
const scIframe    = document.getElementById('sc-iframe');

// Cached icon refs (P-10)
let iconPlay = null, iconPause = null;

function cacheIcons() {
  if (!iconPlay && scPlayBtn) {
    iconPlay  = scPlayBtn.querySelector('.icon-play');
    iconPause = scPlayBtn.querySelector('.icon-pause');
  }
}

// Deferred SC loading (P-3, P-4, A-2)
// SC API script and iframe src are not loaded until first Music page visit.
window.initSC = function() {
  if (scInitialized) return;
  scInitialized = true;

  // Inject iframe src
  const dataSrc = scIframe.getAttribute('data-src');
  if (dataSrc && !scIframe.src.includes('soundcloud.com')) {
    scIframe.src = dataSrc;
  }

  // Dynamically load SC API script
  const script = document.createElement('script');
  script.src = 'https://w.soundcloud.com/player/api.js';
  script.onload = function() {
    try {
      scWidget = SC.Widget(scIframe);
      scWidget.bind(SC.Widget.Events.READY, () => {
        scReady = true;
        if (scPendingPlay) { scPendingPlay = false; scWidget.play(); }
      });
      scWidget.bind(SC.Widget.Events.PLAY, () => {
        scPlaying = true;
        clearTimeout(scPauseTimer);
        scWidget.getCurrentSound(s => {
          scTrackName.textContent = `${s ? s.title : SC_TRACKS[scTrackIdx].title} - (soundcloud)`;
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
    } catch (e) {
      console.warn('SoundCloud widget init failed:', e);
    }
  };
  document.body.appendChild(script);
};

function loadTrack(idx, autoPlay) {
  if (!scWidget) return;
  scTrackIdx = ((idx % SC_TRACKS.length) + SC_TRACKS.length) % SC_TRACKS.length;
  scReady = false; scPlaying = false;
  if (autoPlay) scPendingPlay = true;
  scTrackName.textContent = `${SC_TRACKS[scTrackIdx].title} - (soundcloud)`;
  scWidget.load(SC_TRACKS[scTrackIdx].url, {
    auto_play: false, hide_related: true, show_comments: false,
    show_user: false, show_reposts: false, show_teaser: false, visual: true
  });
}

function togglePlay() {
  if (!scWidget) return;
  if (!scReady) { scPendingPlay = true; return; }
  scPlaying ? scWidget.pause() : scWidget.play();
}

function syncPlayer(reason) {
  cacheIcons();
  if (iconPlay)  iconPlay.style.display  = scPlaying ? 'none' : '';
  if (iconPause) iconPause.style.display = scPlaying ? '' : 'none';
  record.setPlaying(scPlaying);
  if (scPlaying) startTonearmSweep(scDuration > 0);
  else if (reason === 'finish') finishTonearm();
  else if (reason === 'pause') pauseTonearm();
  else stopTonearmSweep();
}

// ── SC BUTTON LISTENERS ─────────────────────
recordEl.addEventListener('click', () => {
  if (record._didDrag) { record._didDrag = false; return; }
  if (!scInitialized && typeof window.initSC === 'function') window.initSC();
  scPlayerEl.classList.add('visible');
  scTrackName.textContent = `${SC_TRACKS[scTrackIdx].title} - (soundcloud)`;
  togglePlay();
});

scCloseBtn.addEventListener('click', e => {
  e.stopPropagation();
  clearTimeout(scPauseTimer);
  if (scWidget && scPlaying) scWidget.pause();
  scPlayerEl.classList.remove('visible');
});

tonearmEl.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPlayBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
scPrevBtn.addEventListener('click', e => { e.stopPropagation(); loadTrack(scTrackIdx - 1, scPlaying); });
scNextBtn.addEventListener('click', e => { e.stopPropagation(); loadTrack(scTrackIdx + 1, scPlaying); });
