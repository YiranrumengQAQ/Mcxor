import { Processor } from './processor.js';
import { Icons } from './icons.js';

const $ = (selector) => document.querySelector(selector);
const setIcon = (id, icon) => {
  const element = document.getElementById(id);
  if (element) element.innerHTML = icon();
};

setIcon('upload-icon', Icons.upload);
setIcon('file-icon', Icons.file);
setIcon('key-icon', Icons.key);
setIcon('secure-icon', Icons.shield);
setIcon('decrypt-icon', Icons.bolt);
setIcon('arrow-icon', Icons.arrow);
setIcon('top-help-icon', Icons.help);
setIcon('close-icon', Icons.close);

const state = {
  file: null,
  blob: null,
  usedManual: false,
  theme: localStorage.getItem('mcxor_theme') || 'dark'
};
const body = document.documentElement;
const modal = $('#modal');

function applyTheme() {
  body.dataset.theme = state.theme;
  localStorage.setItem('mcxor_theme', state.theme);
  setIcon('theme-icon', state.theme === 'dark' ? Icons.sun : Icons.moon);
}

function showModal() {
  $('#modal-content').innerHTML = `
    <span class="section-kicker">LOCAL WORKFLOW</span>
    <h2>三步完成</h2>
    <ol>
      <li>拖入或选择一个 .zip 存档。</li>
      <li>读取到密钥后自动解密；找不到时输入 16 位十六进制密钥。</li>
      <li>下载解密后的 .mcworld 文件。</li>
    </ol>
    <p class="muted">文件始终只在当前浏览器内处理。</p>`;
  modal.showModal();
}

function showResult(type, data) {
  const element = $('#result');
  element.className = `result ${type}`;
  element.classList.remove('hidden');
  if (type === 'error') {
    element.innerHTML = `<div class="result-title">${Icons.error()}<b>解密未完成</b></div><p>${data}</p>`;
    return;
  }
  element.innerHTML = `
    <div class="result-title">${Icons.check()}<b>世界已恢复</b></div>
    <div class="stats">
      <span><b>${data.count}</b><small>已解密文件</small></span>
      <span><b>${data.total}</b><small>总文件数</small></span>
      <span><b>${data.duration}s</b><small>处理耗时</small></span>
    </div>
    <div class="key-result"><code>${data.key}</code><button id="copy-key">复制密钥</button></div>
    <button class="download-button" id="download">${Icons.download()}下载 .mcworld</button>`;

  $('#copy-key').onclick = async () => {
    try {
      await navigator.clipboard.writeText(data.key);
      $('#copy-key').textContent = '已复制';
    } catch {
      $('#copy-key').textContent = '复制失败';
    }
  };
  $('#download').onclick = download;
}

function setFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.zip')) {
    showResult('error', '仅支持 .zip 格式的存档文件');
    return;
  }
  state.file = file;
  state.blob = null;
  $('#file-name').textContent = file.name;
  $('#file-size').textContent = Processor.formatSize(file.size);
  $('#file-card').classList.remove('hidden');
  $('#key-box').classList.add('hidden');
  $('#progress-area').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#decrypt-button').disabled = false;
}

function clearFile() {
  state.file = null;
  state.blob = null;
  $('#file-input').value = '';
  $('#file-card').classList.add('hidden');
  $('#key-box').classList.add('hidden');
  $('#progress-area').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#decrypt-button').disabled = true;
}

function showKeyInput() {
  $('#key-box').classList.remove('hidden');
  window.requestAnimationFrame(() => $('#manual-key').focus());
}

function progress(percent, status, path = '') {
  $('#progress-area').classList.remove('hidden');
  $('#progress-bar').style.width = `${percent}%`;
  $('#progress-value').textContent = `${percent}%`;
  $('#progress-status').textContent = status;
  $('#progress-file').textContent = path || '正在处理世界数据';
}

async function decrypt() {
  if (!state.file) return;
  const button = $('#decrypt-button');
  button.disabled = true;
  $('#result').classList.add('hidden');
  const start = performance.now();
  try {
    const manual = $('#manual-key').value.trim();
    const data = await Processor.decrypt(state.file, manual, progress);
    state.blob = data.blob;
    state.usedManual = data.usedManual;
    showResult('success', { ...data, duration: ((performance.now() - start) / 1000).toFixed(2) });
    progress(100, '完成');
  } catch (error) {
    if (error.code === 'KEY_REQUIRED') showKeyInput();
    showResult('error', error.message);
    progress(0, '等待任务');
  } finally {
    button.disabled = !state.file;
  }
}

function download() {
  if (!state.blob) return;
  const url = URL.createObjectURL(state.blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Decrypted.mcworld';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}

$('#drop-zone').onclick = () => $('#file-input').click();
$('#drop-zone').ondragover = (event) => {
  event.preventDefault();
  $('#drop-zone').classList.add('dragging');
};
$('#drop-zone').ondragleave = () => $('#drop-zone').classList.remove('dragging');
$('#drop-zone').ondrop = (event) => {
  event.preventDefault();
  $('#drop-zone').classList.remove('dragging');
  setFile(event.dataTransfer.files[0]);
};
$('#file-input').onchange = (event) => setFile(event.target.files[0]);
$('#manual-key').oninput = (event) => {
  event.target.value = event.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 16);
};
$('#decrypt-button').onclick = decrypt;

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'theme') {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  }
  if (action === 'help') showModal();
  if (action === 'clear') clearFile();
  if (action === 'close') modal.close();
});
$('#drop-zone').onkeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    $('#file-input').click();
  }
};
applyTheme();

// Procedural rain and water on the foreground glass. Each drop has its own
// velocity, gravity, drift and trail, so the motion is calculated every frame.
const rainCanvas = $('#rain-canvas');
const glassCanvas = $('#glass-canvas');
const rainCtx = rainCanvas.getContext('2d', { alpha: true, desynchronized: true });
const glassCtx = glassCanvas.getContext('2d', { alpha: true, desynchronized: true });
let viewportWidth = innerWidth;
let viewportHeight = innerHeight;
let rainDrops = [];
let glassDrops = [];
let impacts = [];
let previousFrame = performance.now();

function resizeRain() {
  const pixelRatio = devicePixelRatio || 1;
  viewportWidth = innerWidth;
  viewportHeight = innerHeight;
  for (const canvas of [rainCanvas, glassCanvas]) {
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
  }
  rainCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  glassCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createRainDrop(startAnywhere = true) {
  const length = 15 + Math.random() * 36;
  return {
    x: Math.random() * viewportWidth,
    y: startAnywhere ? Math.random() * viewportHeight : -length - Math.random() * 40,
    length,
    width: .35 + Math.random() * .75,
    velocity: 11 + Math.random() * 15,
    wind: -.26 - Math.random() * .32,
    alpha: .11 + Math.random() * .32
  };
}

function createGlassDrop(startAnywhere = true) {
  const radius = 2 + Math.random() * 4.8;
  return {
    x: Math.random() * viewportWidth,
    y: startAnywhere ? Math.random() * viewportHeight * .82 : -radius * 2,
    radius,
    velocity: .16 + Math.random() * .55,
    gravity: .012 + Math.random() * .022,
    drift: (Math.random() - .5) * .12,
    wobble: Math.random() * Math.PI * 2,
    age: Math.random() * 100,
    opacity: .28 + Math.random() * .47,
    trail: []
  };
}

function seedRain() {
  const rainCount = Math.min(900, Math.max(380, Math.floor(viewportWidth / 1.8)));
  const glassCount = Math.min(120, Math.max(58, Math.floor(viewportWidth / 13)));
  rainDrops = Array.from({ length: rainCount }, () => createRainDrop(true));
  glassDrops = Array.from({ length: glassCount }, () => createGlassDrop(true));
  impacts = [];
}

function addImpact(x, y, radius) {
  impacts.push({ x, y, radius: 1, alpha: .5, max: radius * 2.2 });
  if (impacts.length > 40) impacts.shift();
}

function drawRain(delta) {
  rainCtx.clearRect(0, 0, viewportWidth, viewportHeight);
  rainCtx.lineCap = 'round';
  for (const drop of rainDrops) {
    drop.velocity += .018 * delta;
    drop.y += drop.velocity * delta;
    drop.x += drop.wind * delta;
    if (drop.y > viewportHeight + 60 || drop.x < -60) {
      Object.assign(drop, createRainDrop(false));
      continue;
    }
    const tail = drop.length * (1 + drop.velocity / 35);
    const gradient = rainCtx.createLinearGradient(drop.x, drop.y, drop.x + drop.wind * 3, drop.y + tail);
    gradient.addColorStop(0, `rgba(226,248,255,${drop.alpha * .1})`);
    gradient.addColorStop(.28, `rgba(172,228,250,${drop.alpha})`);
    gradient.addColorStop(1, 'rgba(105,191,227,0)');
    rainCtx.strokeStyle = gradient;
    rainCtx.lineWidth = drop.width;
    rainCtx.beginPath();
    rainCtx.moveTo(drop.x, drop.y);
    rainCtx.lineTo(drop.x + drop.wind * 3, drop.y + tail);
    rainCtx.stroke();
  }
}

function drawGlass(delta, now) {
  glassCtx.clearRect(0, 0, viewportWidth, viewportHeight);
  glassCtx.lineCap = 'round';
  glassCtx.lineJoin = 'round';

  for (const drop of glassDrops) {
    drop.age += delta;
    drop.velocity += drop.gravity * delta;
    drop.y += drop.velocity * delta;
    drop.x += drop.drift * delta + Math.sin(drop.age * .023 + drop.wobble) * .045 * delta;
    drop.trail.push({ x: drop.x, y: drop.y });
    if (drop.trail.length > 10) drop.trail.shift();

    if (drop.y > viewportHeight + drop.radius * 3) {
      addImpact(drop.x, viewportHeight - 2, drop.radius);
      Object.assign(drop, createGlassDrop(false));
      continue;
    }

    const trailLength = Math.min(90, drop.radius * 8 + drop.velocity * 20);
    const tailY = drop.y - trailLength;
    const trail = glassCtx.createLinearGradient(drop.x, tailY, drop.x, drop.y);
    trail.addColorStop(0, 'rgba(155,226,247,0)');
    trail.addColorStop(.72, `rgba(181,237,255,${drop.opacity * .10})`);
    trail.addColorStop(1, `rgba(224,250,255,${drop.opacity * .42})`);
    glassCtx.strokeStyle = trail;
    glassCtx.lineWidth = Math.max(.45, drop.radius * .34);
    glassCtx.beginPath();
    glassCtx.moveTo(drop.x - drop.radius * .18, tailY);
    glassCtx.lineTo(drop.x, drop.y - drop.radius * .62);
    glassCtx.stroke();

    const glow = glassCtx.createRadialGradient(
      drop.x - drop.radius * .42, drop.y - drop.radius * .5, .2,
      drop.x, drop.y, drop.radius * 2.1
    );
    glow.addColorStop(0, `rgba(255,255,255,${drop.opacity * .8})`);
    glow.addColorStop(.19, `rgba(205,245,255,${drop.opacity * .42})`);
    glow.addColorStop(.62, `rgba(111,199,238,${drop.opacity * .13})`);
    glow.addColorStop(1, 'rgba(82,169,224,0)');
    glassCtx.fillStyle = glow;
    glassCtx.beginPath();
    glassCtx.ellipse(drop.x, drop.y, drop.radius * .95, drop.radius * 1.35, -.16, 0, Math.PI * 2);
    glassCtx.fill();

    glassCtx.strokeStyle = `rgba(224,249,255,${drop.opacity * .55})`;
    glassCtx.lineWidth = .55;
    glassCtx.beginPath();
    glassCtx.ellipse(drop.x, drop.y, drop.radius * .72, drop.radius, -.16, 0, Math.PI * 2);
    glassCtx.stroke();

    // A tiny specular glint makes the bead read as a rounded water surface.
    glassCtx.fillStyle = `rgba(255,255,255,${drop.opacity * .72})`;
    glassCtx.beginPath();
    glassCtx.ellipse(drop.x - drop.radius * .3, drop.y - drop.radius * .42, .62, .34, -.35, 0, Math.PI * 2);
    glassCtx.fill();
  }

  for (const impact of impacts) {
    impact.radius += .45 * delta;
    impact.alpha -= .012 * delta;
    if (impact.alpha <= 0) continue;
    glassCtx.strokeStyle = `rgba(183,239,255,${impact.alpha})`;
    glassCtx.lineWidth = .7;
    glassCtx.beginPath();
    glassCtx.ellipse(impact.x, impact.y, impact.radius * 1.8, impact.radius * .55, 0, 0, Math.PI * 2);
    glassCtx.stroke();
  }
  impacts = impacts.filter((impact) => impact.alpha > 0 && impact.radius < impact.max);

  // Soft moving reflection bands are calculated on the same transparent glass layer.
  const sheen = glassCtx.createLinearGradient(0, 0, viewportWidth, viewportHeight);
  const sweep = (Math.sin(now * .00016) + 1) / 2;
  sheen.addColorStop(Math.max(0, sweep - .12), 'rgba(255,255,255,0)');
  sheen.addColorStop(sweep, 'rgba(188,241,255,.024)');
  sheen.addColorStop(Math.min(1, sweep + .12), 'rgba(255,255,255,0)');
  glassCtx.fillStyle = sheen;
  glassCtx.fillRect(0, 0, viewportWidth, viewportHeight);
}

function animateRain(now) {
  const delta = Math.min(2.4, Math.max(.35, (now - previousFrame) / 16.667));
  previousFrame = now;
  drawRain(delta);
  drawGlass(delta, now);
  requestAnimationFrame(animateRain);
}

addEventListener('resize', () => {
  resizeRain();
  seedRain();
}, { passive: true });
resizeRain();
seedRain();
requestAnimationFrame(animateRain);
