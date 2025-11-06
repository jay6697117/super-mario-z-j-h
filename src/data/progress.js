// 轻量本地存档（世界进度与中途旗）
const KEY = 'sm_progress_v1';

function read() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return {}; return JSON.parse(raw); } catch { return {}; }
}
function write(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}

export function loadProgress() { return read(); }
export function saveProgress(p) { write(p || {}); }
export function setCurrentLevel(index) { const p = read(); p.currentLevelIndex = index|0; write(p); }
export function getCurrentLevel() { const p = read(); return (typeof p.currentLevelIndex==='number') ? p.currentLevelIndex|0 : 0; }
export function setCheckpoint(levelId, pos) { const p = read(); if (!p.checkpoints) p.checkpoints = {}; p.checkpoints[levelId] = { x: pos.x|0, y: pos.y|0 }; write(p); }
export function getCheckpoint(levelId) { const p = read(); return (p.checkpoints && p.checkpoints[levelId]) ? p.checkpoints[levelId] : null; }
export function clearCheckpoint(levelId) { const p = read(); if (p.checkpoints && p.checkpoints[levelId]) { delete p.checkpoints[levelId]; write(p); } }

// 一次性掉落消耗持久化（按关卡）
export function addConsumedSpawn(levelId, key){
  if (!levelId || !key) return;
  const p = read(); if (!p.consumed) p.consumed = {};
  const arr = Array.isArray(p.consumed[levelId]) ? p.consumed[levelId] : (p.consumed[levelId] = []);
  if (!arr.includes(key)) arr.push(key);
  write(p);
}
export function getConsumedSpawns(levelId){ const p = read(); const arr = p.consumed && p.consumed[levelId]; return Array.isArray(arr) ? arr.slice() : []; }
export function clearConsumedSpawns(levelId){ const p = read(); if (p.consumed && p.consumed[levelId]) { delete p.consumed[levelId]; write(p); } }

// RNG 种子持久化
export function setRngSeed(seed){ const p = read(); if (seed==null) { delete p.rngSeed; } else { p.rngSeed = String(seed); } write(p); }
export function getRngSeed(){ const p = read(); return (p.rngSeed!=null) ? String(p.rngSeed) : null; }
