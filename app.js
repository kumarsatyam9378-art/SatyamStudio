// ─────────────────────────────────
// HELPERS
// ─────────────────────────────────
const $ = id => document.getElementById(id);
let mode = 'img', curTool = '', imgLoaded = false, vidLoaded = false;
let origImg = null, hist = [], histIdx = -1;
let adj = { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, fade: 0, vignette: 0, warmth: 0, vibrance: 0, sharpness: 0, noise: 0, clarity: 0, dehaze: 0, texture: 0, shadows: 0, highlights: 0, whites: 0, blacks: 0 };
let hslAdjs = { rh: 0, rs: 0, gh: 0, gs: 0, bh: 0, bs: 0 };
let tone = 'none', curFilt = '', filtStr = 100;
let snapFilt = '', snapStr = 80;
let cropR = 'free', cropBx = { x: 0, y: 0, w: 0, h: 0 };
let txtColor = '#fff', fSize = 40, tBold = false, tItalic = false, tShadow = false, tOutline = false, tGlow = false, tUnder = false, tStrike = false, tAlign = 'left', tBG = 'none';
let brushColor = '#FF4757', brushType = 'pen', drawing = false, lx = 0, ly = 0, symMode = 'none';
let beauty = { smooth: 0, glow: 0, sharpen: 0, grain: 0, slim: 0, bright: 0, denoise: 0, portrait: 0 };
let expRes = 'orig', expFmt = 'jpeg';
let vtxtColor = '#fff', vtxtStyle = 'normal';
let tinP = null, toutP = null, vidFile = null, isRec = false, mr2 = null;
let frameColor = '#fff', frameWidth = 0, cornerRadius = 5, dropShadow = 0;
let curOverlay = '', curGrad = '', wmPos = 'br', wmColor = '#fff';
let vidBps = 8000000;

// Text overlays array
let texts = [];

function toast(msg, type = 'ok') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ─────────────────────────────────
// TOOL DEFS
// ─────────────────────────────────
const ITOOLS = [
  { id: 'auto', i: '⚡', l: 'Auto' },
  { id: 'adjust', i: '🎨', l: 'Adjust' },
  { id: 'filters', i: '✨', l: 'Filters' },
  { id: 'snap', i: '👻', l: 'Snapchat' },
  { id: 'overlay', i: '🌊', l: 'Overlay' },
  { id: 'crop', i: '✂️', l: 'Crop' },
  { id: 'transform', i: '🔄', l: 'Transform' },
  { id: 'text', i: '📝', l: 'Text' },
  { id: 'stickers', i: '😊', l: 'Stickers' },
  { id: 'draw', i: '✏️', l: 'Draw' },
  { id: 'beauty', i: '💄', l: 'Beauty' },
  { id: 'frame', i: '🖼', l: 'Frame' },
  { id: 'watermark', i: '©', l: 'Watermark' },
  { id: 'histogram', i: '📊', l: 'Stats' },
  { id: 'export', i: '⬇️', l: 'Export' },
];
const VTOOLS = [
  { id: 'vplay', i: '▶️', l: 'Playback' },
  { id: 'vadjust', i: '🎨', l: 'Adjust' },
  { id: 'vtrim', i: '✂️', l: 'Trim' },
  { id: 'vtext', i: '📝', l: 'Text' },
  { id: 'vexport', i: '⬇️', l: 'Export' },
];

const ADJS = [
  { id: 'brightness', l: 'Brightness', mn: -100, mx: 100, def: 0 },
  { id: 'contrast', l: 'Contrast', mn: -100, mx: 100, def: 0 },
  { id: 'saturation', l: 'Saturation', mn: -100, mx: 100, def: 0 },
  { id: 'hue', l: 'Hue', mn: -180, mx: 180, def: 0 },
  { id: 'warmth', l: 'Warmth', mn: -100, mx: 100, def: 0 },
  { id: 'vibrance', l: 'Vibrance', mn: -100, mx: 100, def: 0 },
  { id: 'sharpness', l: 'Sharpen', mn: 0, mx: 100, def: 0 },
  { id: 'clarity', l: 'Clarity', mn: -100, mx: 100, def: 0 },
  { id: 'dehaze', l: 'Dehaze', mn: -100, mx: 100, def: 0 },
  { id: 'texture', l: 'Texture', mn: -100, mx: 100, def: 0 },
  { id: 'shadows', l: 'Shadows', mn: -100, mx: 100, def: 0 },
  { id: 'highlights', l: 'Highlights', mn: -100, mx: 100, def: 0 },
  { id: 'whites', l: 'Whites', mn: -100, mx: 100, def: 0 },
  { id: 'blacks', l: 'Blacks', mn: -100, mx: 100, def: 0 },
  { id: 'blur', l: 'Blur', mn: 0, mx: 20, def: 0 },
  { id: 'vignette', l: 'Vignette', mn: 0, mx: 100, def: 0 },
  { id: 'fade', l: 'Fade', mn: 0, mx: 100, def: 0 },
  { id: 'noise', l: 'Film Grain', mn: 0, mx: 100, def: 0 },
];

const VADJS = [
  { id: 'vbr', l: 'Brightness', mn: 0, mx: 200, def: 100 },
  { id: 'vct', l: 'Contrast', mn: 0, mx: 200, def: 100 },
  { id: 'vst', l: 'Saturation', mn: 0, mx: 300, def: 100 },
  { id: 'vhu', l: 'Hue', mn: -180, mx: 180, def: 0 },
  { id: 'vbl', l: 'Blur', mn: 0, mx: 10, def: 0 },
  { id: 'vop', l: 'Opacity', mn: 0, mx: 100, def: 100 },
  { id: 'vsh', l: 'Sharpness', mn: 0, mx: 100, def: 0 },
  { id: 'vwm', l: 'Warmth', mn: -100, mx: 100, def: 0 },
];

const BEAUTIES = [
  { id: 'smooth', l: 'Skin Smooth', mn: 0, mx: 100, def: 0 },
  { id: 'glow', l: 'Skin Glow', mn: 0, mx: 100, def: 0 },
  { id: 'bright', l: 'Face Bright', mn: 0, mx: 100, def: 0 },
  { id: 'sharpen', l: 'Eye Sharp', mn: 0, mx: 100, def: 0 },
  { id: 'grain', l: 'Film Grain', mn: 0, mx: 100, def: 0 },
  { id: 'slim', l: 'Slim Effect', mn: 0, mx: 100, def: 0 },
  { id: 'denoise', l: 'Denoise', mn: 0, mx: 100, def: 0 },
  { id: 'portrait', l: 'Portrait', mn: 0, mx: 100, def: 0 },
];

const FILTS = [
  { n: 'Normal', f: '' },
  { n: 'Vivid', f: 'saturate(185%) contrast(115%)' },
  { n: 'Warm', f: 'sepia(28%) saturate(145%) brightness(107%)' },
  { n: 'Cool', f: 'hue-rotate(13deg) saturate(125%) brightness(103%)' },
  { n: 'Drama', f: 'contrast(158%) brightness(86%) saturate(72%)' },
  { n: 'Fade', f: 'contrast(76%) brightness(120%) saturate(58%)' },
  { n: 'Chrome', f: 'saturate(215%) contrast(125%)' },
  { n: 'Noir', f: 'grayscale(100%) contrast(158%) brightness(76%)' }
];

const SNAPFILTS = [
  { n: 'Beauty', f: 'brightness(110%) saturate(115%) contrast(95%)', grad: 'rgba(255,200,200,.08)', em: '💖' },
  { n: 'Golden', f: 'sepia(40%) saturate(200%) brightness(110%)', grad: 'rgba(255,200,0,.1)', em: '✨' },
  { n: 'Flower', f: 'hue-rotate(330deg) saturate(130%) brightness(108%)', grad: 'rgba(255,150,200,.1)', em: '🌸' },
];

// ─────────────────────────────────
// INIT
// ─────────────────────────────────
function init() {
  buildTools();
  buildAdjGrid();
  buildVAdjGrid();
  buildBeautyGrid();
  buildFilters();
  buildSnapFilts();

  // Touch scroll fix for panels
  const ps = document.getElementById('psc');
  if (ps) { ps.addEventListener('touchstart', e => e.stopPropagation(), { passive: true }); }
}

function buildTools() {
  const r = $('tr'); r.innerHTML = '';
  (mode === 'img' ? ITOOLS : VTOOLS).forEach(t => {
    const b = document.createElement('button');
    b.className = 'ti' + (curTool === t.id ? ' on' : '');
    b.dataset.id = t.id;
    b.innerHTML = `<span class="tic">${t.i}</span><span class="tlb">${t.l}</span>`;
    b.onclick = () => openP(t.id);
    r.appendChild(b);
  });
}

function setMode(m) {
  mode = m;
  $('imgTab').className = 'mbt' + (m === 'img' ? ' on' : '');
  $('vidTab').className = 'mbt' + (m === 'vid' ? ' on' : '');

  // Switch upload screens if nothing loaded
  $('upI').style.display = (m === 'img' && !imgLoaded) ? 'block' : 'none';
  $('upV').style.display = (m === 'vid' && !vidLoaded) ? 'block' : 'none';

  // Switch previews
  $('pw').style.display = (m === 'img' && imgLoaded) ? 'block' : 'none';
  $('vw').style.display = (m === 'vid' && vidLoaded) ? 'block' : 'none';

  // Rebuild toolbar
  curTool = '';
  closeP();
  buildTools();
}

function openP(id) {
  if (curTool === id) { closeP(); return; }
  curTool = id;

  document.querySelectorAll('.ti').forEach(t => t.classList.remove('on'));
  const tbBtn = document.querySelector(`.ti[data-id="${id}"]`);
  if (tbBtn) tbBtn.classList.add('on');

  document.querySelectorAll('.pnl-s').forEach(p => p.classList.remove('on'));
  const pnl = $('pnl-' + id);
  if (pnl) pnl.classList.add('on');

  $('pnl').classList.add('open');
}

function closeP() {
  curTool = '';
  document.querySelectorAll('.ti').forEach(t => t.classList.remove('on'));
  $('pnl').classList.remove('open');
}

function mkSliderGrid(containerId, defs, prefix) {
  const g = $(containerId); if (!g) return;
  g.innerHTML = '';
  defs.forEach(d => {
    g.innerHTML += `<div class="sr"><div class="sh"><span class="sn">${d.l}</span><span class="sv" id="${prefix}v_${d.id}">${d.def}</span></div><input type="range" min="${d.mn}" max="${d.mx}" value="${d.def}" id="${prefix}s_${d.id}" oninput="${prefix}Adj('${d.id}',this)"></div>`;
  });
}

function buildAdjGrid() { mkSliderGrid('adjGrid', ADJS, 'img'); mkSliderGrid('autoAdjGrid', ADJS, 'auto'); }
function buildVAdjGrid() { mkSliderGrid('vadjGrid', VADJS, 'v'); }
function buildBeautyGrid() { mkSliderGrid('beautyGrid', BEAUTIES, 'b'); }

// Dummies for UI binding
function imgAdj(id, el) { $('imgv_' + id).textContent = el.value; adj[id] = parseInt(el.value); renderCanvas(); }
function autoAdj(id, el) { $('autov_' + id).textContent = el.value; }
function vAdj(id, el) { $('vav_' + id).textContent = el.value; applyVFilters(); }
function bAdj(id, el) { $('bv_' + id).textContent = el.value; }
function hslAdj(id, el) { $('hslv_' + id).textContent = el.value; hslAdjs[id] = parseInt(el.value); renderCanvas(); }

function buildFilters() {
  const r = $('filterRow'); if (!r) return; r.innerHTML = '';
  FILTS.forEach((f, i) => {
    const d = document.createElement('div'); d.className = 'fc' + (i === 0 ? ' on' : '');
    d.innerHTML = `<div class="ft"><div style="width:100%;height:100%;background:linear-gradient(135deg,#d4a0a0,#a0c0e8,#d4d0a0);filter:${f.f || 'none'};display:flex;align-items:center;justify-content:center;font-size:24px">🌄</div></div><div class="fn">${f.n}</div>`;
    d.onclick = () => {
      document.querySelectorAll('.fc').forEach(x => x.classList.remove('on'));
      d.classList.add('on');
      curFilt = f.f;
      renderCanvas();
      toast('✓ ' + f.n, 'ok');
    };
    r.appendChild(d);
  });
}

function buildSnapFilts() {
  const r = $('snapRow'); if (!r) return; r.innerHTML = '';
  SNAPFILTS.forEach((f, i) => {
    const d = document.createElement('div'); d.className = 'sfc' + (i === 0 ? ' on' : '');
    d.innerHTML = `<div class="sft"><div style="width:100%;height:100%;background:linear-gradient(135deg,#e8c0b0,#c0d8f0,#e8e0b0);filter:${f.f};display:flex;align-items:center;justify-content:center;font-size:28px">${f.em}</div></div><div class="sfn">${f.n}</div>`;
    d.onclick = () => {
      document.querySelectorAll('.sfc').forEach(x => x.classList.remove('on'));
      d.classList.add('on');
      snapFilt = f;
      toast('✓ Snap: ' + f.n, 'ok');
    };
    r.appendChild(d);
  });
}

// ─────────────────────────────────
// FILE UPLOAD & PREVIEW
// ─────────────────────────────────
function loadImg(e) {
  const f = e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  origImg = new Image();
  origImg.onload = () => {
    imgLoaded = true;
    $('upI').style.display = 'none';
    $('pw').style.display = 'block';

    // Setup canvas size
    const c = $('dc');
    c.width = origImg.naturalWidth;
    c.height = origImg.naturalHeight;

    // Setup drawing canvas
    const cDraw = document.createElement('canvas');
    cDraw.width = c.width;
    cDraw.height = c.height;
    c.drawLayer = cDraw;

    // Reset state
    adj = Object.fromEntries(ADJS.map(a => [a.id, a.def]));
    curFilt = '';
    texts = [];

    // Ensure UI sliders are reset
    ADJS.forEach(a => {
      if ($('imgs_' + a.id)) $('imgs_' + a.id).value = a.def;
      if ($('imgv_' + a.id)) $('imgv_' + a.id).textContent = a.def;
    });

    updateCanvasCSS();
    renderCanvas();
    openP('adjust');
    pushHist();
  };
  origImg.src = url;
}

function loadVid(e) {
  const f = e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  const v = $('ve');
  v.src = url;
  v.onloadedmetadata = () => {
    vidLoaded = true;
    vidFile = f;
    $('upV').style.display = 'none';
    $('vw').style.display = 'block';
    $('vctrl').style.display = 'block';

    tinP = 0; toutP = v.duration;
    $('vT').textContent = `0:00 / ${formatTime(v.duration)}`;

    applyVFilters();
    openP('vplay');
  };
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────
// CANVAS ENGINE 
// ─────────────────────────────────

// Generate CSS filter string based on adjustments
function getFilterString() {
  let filts = [];
  if (adj.brightness !== 0) filts.push(`brightness(${100 + adj.brightness}%)`);
  if (adj.contrast !== 0) filts.push(`contrast(${100 + adj.contrast}%)`);
  if (adj.saturation !== 0) filts.push(`saturate(${100 + adj.saturation}%)`);
  if (adj.hue !== 0) filts.push(`hue-rotate(${adj.hue}deg)`);
  if (adj.blur > 0) filts.push(`blur(${adj.blur}px)`);
  if (adj.fade > 0) filts.push(`opacity(${100 - (adj.fade / 2)}%) grayscale(${adj.fade / 2}%)`);
  if (curFilt) filts.push(curFilt); // Preset filter

  // Tones
  if (tone === 'bw') filts.push('grayscale(100%)');
  if (tone === 'sepia') filts.push('sepia(100%)');
  if (tone === 'invert') filts.push('invert(100%)');

  return filts.join(' ') || 'none';
}

function renderCanvas() {
  if (!imgLoaded) return;
  const c = $('dc');
  const ctx = c.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, c.width, c.height);

  // Base Image with CSS filters
  ctx.filter = getFilterString();

  // Handle flip/rotate matrix before drawing image
  ctx.save();
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((adj.rotate || 0) * Math.PI / 180);
  ctx.scale(adj.scaleX || 1, adj.scaleY || 1);

  // Draw from center due to translate
  ctx.drawImage(origImg, -c.width / 2, -c.height / 2, c.width, c.height);
  ctx.restore();
  ctx.filter = 'none';

  // Apply Graphical Overlay / Gradients
  if (curGrad) {
    ctx.fillStyle = curGrad;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Draw elements
  if (c.drawLayer) {
    ctx.drawImage(c.drawLayer, 0, 0);
  }

  // Apply Frame
  if (frameWidth > 0) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = frameWidth;
    // Simple internal border
    ctx.strokeRect(frameWidth / 2, frameWidth / 2, c.width - frameWidth, c.height - frameWidth);
  }

  // Watermark
  if (wmPos) {
    ctx.save();
    ctx.font = `bold ${Math.max(20, c.width * 0.03)}px Outfit, sans-serif`;
    ctx.fillStyle = wmColor;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    let pX = 20, pY = 20;
    const mt = ctx.measureText("SATYAM STUDIO PRO");
    if (wmPos.includes('b')) pY = c.height - 30;
    else if (wmPos.includes('t')) pY = 40;
    else pY = c.height / 2;

    if (wmPos.includes('r')) pX = c.width - mt.width - 20;
    else if (wmPos.includes('l')) pX = 20;
    else pX = c.width / 2 - mt.width / 2;

    ctx.fillText("SATYAM STUDIO PRO", pX, pY);
    ctx.restore();
  }

  texts.forEach(t => {
    ctx.save();
    ctx.font = `${t.bold ? 'bold' : ''} ${t.italic ? 'italic' : ''} ${t.size}px ${t.font}`;
    ctx.fillStyle = t.color;
    ctx.textAlign = t.align;

    if (t.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = Math.max(2, t.size * 0.1);
      ctx.shadowOffsetY = Math.max(1, t.size * 0.05);
    }

    if (t.outline) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = Math.max(2, t.size * 0.1);
      ctx.strokeText(t.txt, t.x, t.y);
    }

    if (t.glow) {
      ctx.shadowColor = t.color;
      ctx.shadowBlur = t.size * 0.4;
    }

    ctx.fillText(t.txt, t.x, t.y);
    ctx.restore();
  });
}

// History stack setup
function pushHist() {
  if (!imgLoaded) return;
  const c = $('dc');
  const b58 = c.toDataURL('image/png');
  // We trim future states if we are in middle of undo stack
  hist = hist.slice(0, histIdx + 1);
  hist.push({
    img: origImg.src, // Normally base image is static unless baked
    stateData: b58,
    adj: { ...adj },
    texts: JSON.parse(JSON.stringify(texts)),
    curFilt,
    tone
  });
  histIdx = hist.length - 1;
}

function doUndo() {
  if (histIdx > 0) {
    histIdx--;
    restoreHist();
  }
}

function doRedo() {
  if (histIdx < hist.length - 1) {
    histIdx++;
    restoreHist();
  }
}

function restoreHist() {
  const h = hist[histIdx];
  adj = { ...h.adj };
  texts = JSON.parse(JSON.stringify(h.texts));
  curFilt = h.curFilt;
  tone = h.tone;

  // Re-apply to UI
  Object.keys(adj).forEach(k => {
    if ($('imgs_' + k)) $('imgs_' + k).value = adj[k];
    if ($('imgv_' + k)) $('imgv_' + k).textContent = adj[k];
  });

  renderCanvas();
  toast('History restored', 'ok');
}

// Reset Basic Adjustments
function resetAdj() {
  adj = Object.fromEntries(ADJS.map(a => [a.id, a.def]));
  ADJS.forEach(a => {
    if ($('imgs_' + a.id)) $('imgs_' + a.id).value = a.def;
    if ($('imgv_' + a.id)) $('imgv_' + a.id).textContent = a.def;
  });
  renderCanvas();
  toast('Adjustments Reset', 'ok');
}

// Set Tone emulation (BW, Sepia, etc)
function setTone(t, btn) {
  document.querySelectorAll('#pnl-adjust .chip').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  tone = t;
  renderCanvas();
}

function applySplitTone() {
  // In Canvas 2D without global blending across the image pixels natively, 
  // a basic trick for split toning is adding a Color blend overlay, or simply hue rotating.
  // For simplicity, we stick to the main filters.
  // (This uses advanced pixel manipulation if done flawlessly).
}

function applyFilt() {
  // Triggers render cycle if filter intensity changed
  // In our basic `getFilterString`, we aren't heavily using `sFs` intensity for preset filters yet
  renderCanvas();
}

// ─────────────────────────────────
// DRAWING ENGINE
// ─────────────────────────────────
let isDrawing = false;
let lastX = 0, lastY = 0;

function setupDraw() {
  const p = $('pw');
  p.addEventListener('pointerdown', (e) => {
    if (curTool !== 'draw' || !imgLoaded) return;
    isDrawing = true;
    const rect = p.getBoundingClientRect();
    const rw = $('dc').width / rect.width;
    const rh = $('dc').height / rect.height;
    lastX = (e.clientX - rect.left) * rw;
    lastY = (e.clientY - rect.top) * rh;
  });

  p.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = p.getBoundingClientRect();
    const rw = $('dc').width / rect.width;
    const rh = $('dc').height / rect.height;
    const cx = (e.clientX - rect.left) * rw;
    const cy = (e.clientY - rect.top) * rh;

    const layer = $('dc').drawLayer;
    const ctx = layer.getContext('2d');

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = parseInt($('sBs').value) || 10;

    if (brushType === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = parseInt($('sBo').value) / 100 || 1;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    lastX = cx; lastY = cy;
    ctx.globalAlpha = 1; // Reset
    renderCanvas();
  });

  window.addEventListener('pointerup', () => {
    if (isDrawing) pushHist();
    isDrawing = false;
  });
}
setupDraw();

function setBT(t, btn) {
  document.querySelectorAll('.bt').forEach(e => e.classList.remove('on'));
  btn.classList.add('on');
  brushType = t;
}

function setBC(c, btn) {
  document.querySelectorAll('.cd').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  brushColor = c;
  $('bcP').value = c;
}

function clearDraw() {
  if (!$('dc').drawLayer) return;
  const l = $('dc').drawLayer;
  l.getContext('2d').clearRect(0, 0, l.width, l.height);
  renderCanvas();
}

function drawFlatten() {
  pushHist();
  toast('Drawing flattened', 'ok');
  curTool = ''; closeP();
}

// ─────────────────────────────────
// TEXT ENGINE
// ─────────────────────────────────
function addTxt() {
  const txt = $('txtIn').value;
  if (!txt) { toast('Enter text first', 'err'); return; }

  texts.push({
    id: Date.now(),
    txt,
    x: $('dc').width / 2,
    y: $('dc').height / 2,
    font: $('txtFont').value,
    size: fSize,
    color: txtColor,
    bold: tBold, italic: tItalic,
    shadow: tShadow, outline: tOutline, glow: tGlow,
    align: tAlign
  });

  $('txtIn').value = '';
  renderCanvas();
  pushHist();
  toast('Text added', 'ok');
}

function afs(v) {
  fSize = Math.max(10, fSize + v);
  $('fsd').textContent = fSize;
}
function setTC(c, btn) {
  document.querySelectorAll('.cstr .cd').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  txtColor = c;
}
function tglState(btn, stateVar, clz) {
  const s = !stateVar;
  if (s) btn.classList.add('on'); else btn.classList.remove('on');
  return s;
}
function togTB() { tBold = tglState($('tbld'), tBold); }
function togTI() { tItalic = tglState($('titl'), tItalic); }
function togTS() { tShadow = tglState($('tshd'), tShadow); }
function togTO() { tOutline = tglState($('totl'), tOutline); }
function togTG() { tGlow = tglState($('tglw'), tGlow); }
function setTA(a, btn) {
  document.querySelectorAll('#pnl-text .chip[id^=ta-]').forEach(e => e.classList.remove('on'));
  btn.classList.add('on');
  tAlign = a;
}

// Basic Dragging capabilities on canvas for text
let draggedEl = null;
$('pw').addEventListener('pointerdown', e => {
  if (curTool !== 'text' || texts.length === 0) return;
  const rect = $('pw').getBoundingClientRect();
  const rw = $('dc').width / rect.width;
  const rh = $('dc').height / rect.height;
  const cx = (e.clientX - rect.left) * rw;
  const cy = (e.clientY - rect.top) * rh;

  // Find highest element hit
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    // crude bounding box estimate
    const metrics = $('dc').getContext('2d').measureText(t.txt); // relies on correct font config
    const hw = (metrics.width || t.size * t.txt.length * 0.6) / 2;
    if (Math.abs(cx - t.x) < hw && Math.abs(cy - t.y) < t.size) {
      draggedEl = t;
      break;
    }
  }
});

$('pw').addEventListener('pointermove', e => {
  if (!draggedEl) return;
  const rect = $('pw').getBoundingClientRect();
  const rw = $('dc').width / rect.width;
  const rh = $('dc').height / rect.height;
  draggedEl.x = (e.clientX - rect.left) * rw;
  draggedEl.y = (e.clientY - rect.top) * rh;
  renderCanvas();
});

window.addEventListener('pointerup', () => draggedEl = null);

// ─────────────────────────────────
// TRANSFORM & CROP Stub
// ─────────────────────────────────
function doRotate(deg) {
  adj.rotate = (adj.rotate || 0) + deg;
  renderCanvas();
}
function freeRot(v) {
  adj.rotate = parseInt(v);
  renderCanvas();
}
function doFlip(dim) {
  if (dim === 'h') adj.scaleX = (adj.scaleX || 1) * -1;
  if (dim === 'v') adj.scaleY = (adj.scaleY || 1) * -1;
  renderCanvas();
}
function doScale(v) {
  const s = parseInt(v) / 100;
  adj.scaleX = (adj.scaleX > 0 ? 1 : -1) * s;
  adj.scaleY = (adj.scaleY > 0 ? 1 : -1) * s;
  renderCanvas();
}
function resetTransform() {
  adj.rotate = 0; adj.scaleX = 1; adj.scaleY = 1;
  $('sRot').value = 0; $('vRot').textContent = '0°';
  $('sScale').value = 100; $('vScale').textContent = '100%';
  renderCanvas();
}
function bakeTransform() {
  pushHist(); toast('Transform Baked', 'ok');
}
function setCropR(ratio, btn) {
  document.querySelectorAll('#cropChips .chip').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  cropR = ratio;
  // Show resizable box over pw logically. Not full geometry implemented for size limits here.
  toast('Ratio Selected', 'ok');
}
function applyCrop() {
  toast('Crop Applied', 'ok'); // Placeholder
}
function cancelCrop() { closeP(); }
function doResize() { toast('Resized', 'ok'); }

// ─────────────────────────────────
// STICKERS / EMOJIS
// ─────────────────────────────────
function addSticker(emoji) {
  texts.push({
    id: Date.now(), txt: emoji,
    x: $('dc').width / 2, y: $('dc').height / 2,
    font: 'Arial', size: 100, color: '#fff',
    bold: false, italic: false, shadow: false, outline: false, glow: false, align: 'center'
  });
  renderCanvas(); pushHist();
  toast('Sticker Added!', 'ok');
}

// ─────────────────────────────────
// OVERLAYS & GRADIENTS
// ─────────────────────────────────
function setGrad(g, btn) {
  document.querySelectorAll('.grad-row .grad-item').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  curGrad = g;
  renderCanvas();
  toast('Overlay Applied', 'ok');
}

// ─────────────────────────────────
// FRAMES
// ─────────────────────────────────
function setFC(c, btn) {
  document.querySelectorAll('#pnl-frame .cd').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  frameColor = c;
  renderCanvas();
}
function setFW(w) {
  frameWidth = parseInt(w);
  $('fwv').textContent = w + 'px';
  renderCanvas();
}
function tglFrame() {
  if (frameWidth > 0) { frameWidth = 0; $('fwS').value = 0; $('fwv').textContent = '0px'; }
  else { frameWidth = 20; $('fwS').value = 20; $('fwv').textContent = '20px'; }
  renderCanvas();
}

// ─────────────────────────────────
// WATERMARK
// ─────────────────────────────────
function setWMP(p, btn) {
  document.querySelectorAll('#wmr .chip').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  wmPos = p;
  renderCanvas();
}
function setWMC(c, btn) {
  document.querySelectorAll('#wmc .cd').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  wmColor = c;
  renderCanvas();
}

// ─────────────────────────────────
// HISTOGRAM (MOCKUP)
// ─────────────────────────────────
function updateHistMock() {
  const hc = $('histCanvas');
  if (!hc || !imgLoaded) return;
  const ctx = hc.getContext('2d');
  ctx.clearRect(0, 0, hc.width, hc.height);

  ctx.fillStyle = 'rgba(255, 71, 87, 0.6)';
  ctx.beginPath();
  ctx.moveTo(0, hc.height);
  for (let i = 0; i < hc.width; i += 4) {
    // Generate pseudo-random curve based on brightness
    let y = Math.random() * (hc.height * 0.8) + (adj.brightness > 0 ? -10 : 10);
    y = Math.max(0, Math.min(hc.height, y));
    ctx.lineTo(i, hc.height - y);
  }
  ctx.lineTo(hc.width, hc.height);
  ctx.closePath();
  ctx.fill();

  // Stats text update
  const stats = [
    `Res: ${origImg.naturalWidth}x${origImg.naturalHeight}`,
    `Aspect: ${(origImg.naturalWidth / origImg.naturalHeight).toFixed(2)}`,
    `Size: ~${origImg.src.length / 1024 > 1024 ? (origImg.src.length / 1024 / 1024).toFixed(1) + 'MB' : (origImg.src.length / 1024).toFixed(0) + 'KB'}`
  ];
  $('istats').innerHTML = stats.join('<br/>');
}
// Hook into panel open
const origOpenP = openP;
openP = function (id) {
  origOpenP(id);
  if (id === 'histogram') updateHistMock();
};

// ─────────────────────────────────
// VIDEO CONTROLS
// ─────────────────────────────────
function togPlay() {
  const v = $('ve');
  if (!v.paused) { v.pause(); $('plB').textContent = '▶'; }
  else { v.play(); $('plB').textContent = '⏸'; }
}
function setVol(val) {
  if (!$('ve')) return;
  $('ve').volume = val / 100;
  const vI = $('sVol'); if (vI && vI !== document.activeElement) vI.value = val;
  const mI = $('mainVol'); if (mI && mI !== document.activeElement) mI.value = val;
}
function vSkip(s) { $('ve').currentTime += s; }
function setSpd(v, btn) {
  if (btn) {
    document.querySelectorAll('#spdChips .chip').forEach(c => c.classList.remove('on'));
    btn.classList.add('on');
  }
  $('ve').playbackRate = v;
}

// ─────────────────────────────────
// VIDEO ADJUST & TRIM
// ─────────────────────────────────
let vadj = { vbr: 100, vct: 100, vst: 100, vhu: 0, vbl: 0, vop: 100, vsh: 0, vwm: 0 };
let vloop = false;

function applyVFilters() {
  const v = $('ve');
  if (!v) return;
  let f = [];
  if (vadj.vbr !== 100) f.push(`brightness(${vadj.vbr}%)`);
  if (vadj.vct !== 100) f.push(`contrast(${vadj.vct}%)`);
  if (vadj.vst !== 100) f.push(`saturate(${vadj.vst}%)`);
  if (vadj.vhu !== 0) f.push(`hue-rotate(${vadj.vhu}deg)`);
  if (vadj.vbl > 0) f.push(`blur(${vadj.vbl}px)`);
  if (vadj.vop !== 100) v.style.opacity = vadj.vop / 100;

  // Preset
  if (curFilt && mode === 'vid') f.push(curFilt);

  v.style.filter = f.join(' ') || 'none';
}

function vPre(p) {
  // Mock logic for preset mapping
  toast(`Applied Preset: ${p}`, 'ok');
}

function resetVAdj() {
  vadj = { vbr: 100, vct: 100, vst: 100, vhu: 0, vbl: 0, vop: 100, vsh: 0, vwm: 0 };
  VADJS.forEach(a => {
    if ($('vs_' + a.id)) $('vs_' + a.id).value = a.def;
    if ($('vav_' + a.id)) $('vav_' + a.id).textContent = a.def;
  });
  applyVFilters();
  toast('Video Adjustments Reset', 'ok');
}

function setIn() {
  if (!vidLoaded) return;
  tinP = $('ve').currentTime;
  $('tiIN').textContent = formatTime(tinP);
  updateDUR();
}
function setOut() {
  if (!vidLoaded) return;
  toutP = $('ve').currentTime;
  if (toutP <= tinP) toutP = $('ve').duration;
  $('tiOUT').textContent = formatTime(toutP);
  updateDUR();
}
function updateDUR() {
  if (toutP > tinP) $('tiDUR').textContent = formatTime(toutP - tinP);
}
function resetTrim() {
  if (!vidLoaded) return;
  tinP = 0; toutP = $('ve').duration;
  $('tiIN').textContent = '—'; $('tiOUT').textContent = '—'; $('tiDUR').textContent = '—';
}

setInterval(() => {
  if (vidLoaded) {
    const v = $('ve');
    $('vT').textContent = `${formatTime(v.currentTime)} / ${formatTime(v.duration)}`;
    $('skP').style.width = `${(v.currentTime / v.duration) * 100}%`;

    // Loop trim logic
    if (toutP && v.currentTime >= toutP) {
      if (vloop) {
        v.currentTime = tinP || 0;
      } else {
        v.pause();
        $('plB').textContent = '▶';
      }
    }
  }
}, 100);

function skClick(e) {
  const rect = $('skBar').getBoundingClientRect();
  const pc = (e.clientX - rect.left) / rect.width;
  $('ve').currentTime = pc * $('ve').duration;
}

// ─────────────────────────────────
// VIDEO TEXT OVERLAY
// ─────────────────────────────────
function applyVT() {
  const txt = $('vtIn').value;
  const vtl = $('vtl');
  if (!txt) { vtl.style.display = 'none'; return; }

  vtl.textContent = txt;
  vtl.style.display = 'block';

  const fs = parseInt($('sVfs').value) || 36;
  const py = parseInt($('sVpy').value) || 50;

  vtl.style.fontSize = fs + 'px';
  vtl.style.color = vtxtColor;
  vtl.style.top = py + '%';
  vtl.style.transform = `translateY(-50%)`;
  vtl.style.left = '50%';
  vtl.style.transform += ` translateX(-50%)`;

  if (vtxtStyle === 'shadow') {
    vtl.style.textShadow = '2px 4px 10px rgba(0,0,0,0.8)';
    vtl.style.border = 'none'; vtl.style.background = 'none';
  } else if (vtxtStyle === 'glow') {
    vtl.style.textShadow = `0 0 10px ${vtxtColor}, 0 0 20px ${vtxtColor}`;
    vtl.style.border = 'none'; vtl.style.background = 'none';
  } else {
    vtl.style.textShadow = '0 2px 14px rgba(0,0,0,.95)';
  }
}

function setVC(c, btn) {
  document.querySelectorAll('#pnl-vtext .cd').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  vtxtColor = c;
  applyVT();
}

function setVTS(s, btn) {
  document.querySelectorAll('#pnl-vtext .chip[id^=vts-]').forEach(e => e.classList.remove('on'));
  if (btn) btn.classList.add('on');
  vtxtStyle = s;
  applyVT();
}

function clearVT() {
  $('vtIn').value = '';
  $('vtl').style.display = 'none';
}

// ─────────────────────────────────
// VIDEO EXPORT
// ─────────────────────────────────
function dlFrame() {
  if (!vidLoaded) return;
  const v = $('ve');
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext('2d');

  // Apply filters before capture
  ctx.filter = v.style.filter || 'none';
  ctx.drawImage(v, 0, 0, c.width, c.height);

  const a = document.createElement('a');
  a.href = c.toDataURL('image/jpeg', 0.95);
  a.download = `Satyam_Frame_${Date.now()}.jpg`;
  a.click();
  toast('Frame Captured!', 'ok');
}

let chunks = [];
function recVid() {
  if (!vidLoaded) return;
  isRec = true;
  $('recVidBtn').style.display = 'none';
  $('recSt').style.display = 'block';
  chunks = [];

  const v = $('ve');

  // Create an offscreen wrapper canvas to compose video + overlay + filters
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  const ctx = c.getContext('2d');

  const stream = c.captureStream(30);

  try {
    mr2 = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  } catch (e) {
    mr2 = new MediaRecorder(stream);
  }

  mr2.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) };
  mr2.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Satyam_Export_${Date.now()}.webm`;
    a.click();

    $('recVidBtn').style.display = 'block';
    $('recSt').style.display = 'none';
    toast('Video Exported!', 'ok');
  };

  // Transport
  v.currentTime = tinP || 0;
  v.play();
  mr2.start();

  // Recording loop mapping DOM to canvas
  let stT = Date.now();
  let animId;
  function drawStep() {
    if (!isRec) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.filter = v.style.filter || 'none';
    ctx.drawImage(v, 0, 0, c.width, c.height);

    // overlay text
    if ($('vtl').style.display !== 'none') {
      ctx.filter = 'none';
      ctx.fillStyle = $('vtl').style.color;
      ctx.textAlign = 'center';
      ctx.font = $('vtl').style.font || `${parseInt($('vtl').style.fontSize) || 36}px Outfit, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 5;
      ctx.fillText($('vtl').textContent, c.width / 2, c.height * (parseInt($('sVpy').value) || 50) / 100);
    }

    const eps = Math.floor((Date.now() - stT) / 1000);
    const rt = $('recT'); if (rt) rt.textContent = eps + 's';

    if (toutP && v.currentTime >= toutP) {
      stopRec();
    } else {
      animId = requestAnimationFrame(drawStep);
    }
  }
  drawStep();
}

function stopRec() {
  if (!isRec) return;
  isRec = false;
  $('ve').pause();
  if (mr2 && mr2.state !== 'inactive') mr2.stop();
}

// ─────────────────────────────────
// EXPORTING IMAGE
// ─────────────────────────────────
function dlImg() {
  if (!imgLoaded) { toast('Load image first', 'err'); return; }
  const c = $('dc');
  const b58 = c.toDataURL(`image/${expFmt}`, parseInt($('sQ').value) / 100);
  const a = document.createElement('a');
  a.href = b58; a.download = `Satyam_Studio_PRO_${Date.now()}.${expFmt}`;
  a.click();
  toast('Image Saved!', 'ok');
}
function setQ(q, btn) { document.querySelectorAll('.qg .qb').forEach(e => e.classList.remove('on')); btn.classList.add('on'); expRes = q; }
function setFmt(f, btn) { document.querySelectorAll('.fmtr .fmtb').forEach(e => e.classList.remove('on')); btn.classList.add('on'); expFmt = f; }

window.onload = init;
