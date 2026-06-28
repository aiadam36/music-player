const audio       = document.getElementById("audioEl");
const playPauseBtn= document.getElementById("playPauseBtn");
const prevBtn     = document.getElementById("prevBtn");
const nextBtn     = document.getElementById("nextBtn");
const shuffleBtn  = document.getElementById("shuffleBtn");
const repeatBtn   = document.getElementById("repeatBtn");
const muteBtn     = document.getElementById("muteBtn");
const volumeSlider= document.getElementById("volumeSlider");
const progressBar = document.getElementById("progressBar");
const progressFill= document.getElementById("progressFill");
const progressThumb=document.getElementById("progressThumb");
const currentTimeEl=document.getElementById("currentTime");
const durationEl  = document.getElementById("duration");
const trackTitle  = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const albumArt    = document.getElementById("albumArt");
const playlistToggle=document.getElementById("playlistToggle");
const playlistDrawer=document.getElementById("playlistDrawer");
const playlistItems=document.getElementById("playlistItems");
const playlistEmpty=document.getElementById("playlistEmpty");
const trackCount  = document.getElementById("trackCount");
const visualizerCanvas=document.getElementById("visualizer");
const ambient     = document.getElementById("ambient");
const iconPlay    = playPauseBtn.querySelector(".icon-play");
const iconPause   = playPauseBtn.querySelector(".icon-pause");

/* ── State ── */
let tracks     = [];
let currentIdx = 0;
let isPlaying  = false;
let isShuffle  = false;
let isRepeat   = false;
let isDragging = false;

/* Web Audio */
let audioCtx, analyser, source, dataArray, rafId;

/* ══════════════════════════
   1. Load tracks from API
══════════════════════════ */
async function loadTracks() {
  try {
    const res  = await fetch("/api/tracks");
    const data = await res.json();
    tracks = data.tracks || [];
  } catch (e) {
    tracks = [];
  }

  renderPlaylist();

  if (tracks.length > 0) {
    loadTrack(0, false);
  }
}

/* ══════════════════════════
   2. Load a track
══════════════════════════ */
function loadTrack(idx, autoplay = true) {
  if (!tracks.length) return;
  currentIdx = (idx + tracks.length) % tracks.length;
  const track = tracks[currentIdx];

  audio.src  = track.src;
  audio.load();

  trackTitle.textContent  = track.title;
  trackArtist.textContent = track.artist;

  highlightPlaylistItem(currentIdx);

  if (autoplay) {
    play();
  } else {
    setPlayUI(false);
  }
}

/* ══════════════════════════
   3. Play / Pause
══════════════════════════ */
function play() {
  ensureAudioContext();

  audio.play().then(() => {
    setPlayUI(true);
    startVisualizer();
  }).catch(console.warn);
}

function pause() {
  audio.pause();
  setPlayUI(false);
  stopVisualizer();
}

function setPlayUI(playing) {
  isPlaying = playing;
  iconPlay.style.display  = playing ? "none"  : "block";
  iconPause.style.display = playing ? "block" : "none";
  albumArt.classList.toggle("playing", playing);
  ambient.classList.toggle("active",   playing);
}

playPauseBtn.addEventListener("click", () => {
  if (!tracks.length) return;
  isPlaying ? pause() : play();
});

/* ══════════════════════════
   4. Prev / Next
══════════════════════════ */
prevBtn.addEventListener("click", () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    loadTrack(isShuffle ? randomIdx() : currentIdx - 1);
  }
});

nextBtn.addEventListener("click", () => {
  loadTrack(isShuffle ? randomIdx() : currentIdx + 1);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else {
    loadTrack(isShuffle ? randomIdx() : currentIdx + 1);
  }
});

function randomIdx() {
  if (tracks.length <= 1) return 0;
  let idx;
  do { idx = Math.floor(Math.random() * tracks.length); }
  while (idx === currentIdx);
  return idx;
}

/* ══════════════════════════
   5. Shuffle / Repeat
══════════════════════════ */
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

/* ══════════════════════════
   6. Progress bar
══════════════════════════ */
audio.addEventListener("timeupdate", () => {
  if (isDragging || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  setProgress(pct);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

function setProgress(pct) {
  pct = Math.max(0, Math.min(100, pct));
  progressFill.style.width = pct + "%";
  progressThumb.style.left = pct + "%";
}

/* Click/drag on progress bar */
function seekTo(e) {
  const rect = progressBar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  setProgress(pct * 100);
}

progressBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  seekTo(e);
});
document.addEventListener("mousemove", (e) => { if (isDragging) seekTo(e); });
document.addEventListener("mouseup",   ()  => { isDragging = false; });

progressBar.addEventListener("touchstart", (e) => {
  isDragging = true;
  seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener("touchmove",  (e) => { if (isDragging) seekTo(e.touches[0]); }, { passive: true });
document.addEventListener("touchend",   ()  => { isDragging = false; });

/* ══════════════════════════
   7. Volume / Mute
══════════════════════════ */
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
  audio.muted  = audio.volume === 0;
});

muteBtn.addEventListener("click", () => {
  audio.muted = !audio.muted;
  if (audio.muted) {
    volumeSlider.value = 0;
  } else {
    audio.volume       = 0.8;
    volumeSlider.value = 0.8;
  }
});

audio.volume = volumeSlider.value;

/* ══════════════════════════
   8. Playlist UI
══════════════════════════ */
function renderPlaylist() {
  const count = tracks.length;
  trackCount.textContent = `${count} track${count !== 1 ? "s" : ""}`;
  playlistEmpty.style.display = count ? "none" : "block";
  playlistItems.innerHTML = "";

  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "playlist-item";
    li.dataset.idx = i;
    li.innerHTML = `
      <span class="item-num">${i + 1}</span>
      <div class="item-info">
        <div class="item-title">${esc(track.title)}</div>
        <div class="item-artist">${esc(track.artist)}</div>
      </div>
      <span class="item-duration" id="dur-${i}">—</span>
    `;
    li.addEventListener("click", () => {
      if (currentIdx === i && isPlaying) { pause(); }
      else if (currentIdx === i) { play(); }
      else { loadTrack(i); }
    });
    playlistItems.appendChild(li);

    // Pre-load duration via hidden audio
    prefetchDuration(track.src, i);
  });
}

function prefetchDuration(src, idx) {
  const tmp = new Audio();
  tmp.preload = "metadata";
  tmp.src = src;
  tmp.addEventListener("loadedmetadata", () => {
    const el = document.getElementById(`dur-${idx}`);
    if (el) el.textContent = formatTime(tmp.duration);
  });
}

function highlightPlaylistItem(idx) {
  document.querySelectorAll(".playlist-item").forEach((el, i) => {
    el.classList.toggle("active", i === idx);
  });
}

playlistToggle.addEventListener("click", () => {
  playlistDrawer.classList.toggle("open");
});

/* ══════════════════════════
   9. Waveform Visualizer
══════════════════════════ */
function ensureAudioContext() {
  if (audioCtx) return;

  audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
  analyser  = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function startVisualizer() {
  cancelAnimationFrame(rafId);

  const ctx = visualizerCanvas.getContext("2d");
  const W   = visualizerCanvas.width  = visualizerCanvas.offsetWidth;
  const H   = visualizerCanvas.height = visualizerCanvas.offsetHeight;

  const accent   = "#7B5CF0";
  const lavender = "#C4B5FD";

  function draw() {
    rafId = requestAnimationFrame(draw);

    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, W, H);

    const bars  = dataArray.length;
    const gap   = 2;
    const bw    = (W - gap * (bars - 1)) / bars;

    for (let i = 0; i < bars; i++) {
      const v   = dataArray[i] / 255;
      const bh  = Math.max(2, v * H * 0.9);
      const x   = i * (bw + gap);
      const y   = (H - bh) / 2;

      // Gradient per bar: violet → lavender at tip
      const grad = ctx.createLinearGradient(0, y + bh, 0, y);
      grad.addColorStop(0,   accent);
      grad.addColorStop(1,   lavender);

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.85 + v * 0.15;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  draw();
}

function stopVisualizer() {
  cancelAnimationFrame(rafId);

  const ctx = visualizerCanvas.getContext("2d");
  const W   = visualizerCanvas.width  = visualizerCanvas.offsetWidth;
  const H   = visualizerCanvas.height = visualizerCanvas.offsetHeight;

  // Draw flat idle bars
  const bars = 64;
  const gap  = 2;
  const bw   = (W - gap * (bars - 1)) / bars;

  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < bars; i++) {
    const bh = 2;
    const x  = i * (bw + gap);
    const y  = (H - bh) / 2;
    ctx.fillStyle = "rgba(123, 92, 240, 0.25)";
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, 2);
    ctx.fill();
  }
}

/* ══════════════════════════
   Helpers
══════════════════════════ */
function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return `${m}:${sec}`;
}

function esc(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ── Keyboard shortcuts ── */
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space")       { e.preventDefault(); playPauseBtn.click(); }
  if (e.code === "ArrowRight")  { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
  if (e.code === "ArrowLeft")   { audio.currentTime = Math.max(0, audio.currentTime - 5); }
  if (e.code === "ArrowUp")     { e.preventDefault(); audio.volume = Math.min(1, audio.volume + 0.05); volumeSlider.value = audio.volume; }
  if (e.code === "ArrowDown")   { e.preventDefault(); audio.volume = Math.max(0, audio.volume - 0.05); volumeSlider.value = audio.volume; }
  if (e.code === "KeyN")        nextBtn.click();
  if (e.code === "KeyP")        prevBtn.click();
});

/* ── Init ── */
loadTracks();
stopVisualizer(); // Draw idle state
