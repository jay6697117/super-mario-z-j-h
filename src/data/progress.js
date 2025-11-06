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

