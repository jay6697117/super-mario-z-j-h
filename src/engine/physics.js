import { TILE_SIZE } from '../constants.js';

export class Physics {
  constructor() { this.gravity = 2000; this.maxVy = 1800; }

  aabbOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  tileAt(level, col, row) { if (col < 0 || row < 0 || col >= level.cols || row >= level.rows) return '#'; return level.get(col, row); }
  isSolid(t) { return t === '#' || t === 'B' || t === 'Q' || t === 'N' || t === 'M' || t === 'V' || t === 'X'; }

  collideAndSlideRect(rect, vx, vy, level) {
    let dx = vx, dy = vy; // 水平
    if (dx !== 0) {
      const sign = Math.sign(dx);
      const x1 = sign > 0 ? Math.floor((rect.x + rect.w + dx) / TILE_SIZE) : Math.floor((rect.x + dx) / TILE_SIZE);
      const yTop = Math.floor(rect.y / TILE_SIZE);
      const yBot = Math.floor((rect.y + rect.h - 1) / TILE_SIZE);
      for (let y = yTop; y <= yBot; y++) { const t = this.tileAt(level, x1, y); if (this.isSolid(t)) { if (sign > 0) rect.x = x1 * TILE_SIZE - rect.w - 0.01; else rect.x = (x1 + 1) * TILE_SIZE + 0.01; dx = 0; break; } }
      rect.x += dx;
    }
    let onGround = false; let headHit = null; // 竖直
    if (dy !== 0) {
      const sign = Math.sign(dy);
      const y1 = sign > 0 ? Math.floor((rect.y + rect.h + dy) / TILE_SIZE) : Math.floor((rect.y + dy) / TILE_SIZE);
      const xL = Math.floor(rect.x / TILE_SIZE);
      const xR = Math.floor((rect.x + rect.w - 1) / TILE_SIZE);
      for (let x = xL; x <= xR; x++) { const t = this.tileAt(level, x, y1); if (this.isSolid(t)) { if (sign > 0) { rect.y = y1 * TILE_SIZE - rect.h - 0.01; onGround = true; } else { rect.y = (y1 + 1) * TILE_SIZE + 0.01; headHit = { x, y: y1, tile: t }; } dy = 0; break; } }
      rect.y += dy;
    }
    return { onGround, headHit };
  }

  rectTileOverlap(rect, level, predicate) {
    const xL = Math.floor(rect.x / TILE_SIZE);
    const xR = Math.floor((rect.x + rect.w) / TILE_SIZE);
    const yT = Math.floor(rect.y / TILE_SIZE);
    const yB = Math.floor((rect.y + rect.h) / TILE_SIZE);
    for (let y = yT; y <= yB; y++) for (let x = xL; x <= xR; x++) { if (predicate(level.get(x, y))) return true; }
    return false;
  }

  rectFindTile(rect, level, predicate) {
    const xL = Math.floor(rect.x / TILE_SIZE);
    const xR = Math.floor((rect.x + rect.w) / TILE_SIZE);
    const yT = Math.floor(rect.y / TILE_SIZE);
    const yB = Math.floor((rect.y + rect.h) / TILE_SIZE);
    for (let y = yT; y <= yB; y++) for (let x = xL; x <= xR; x++) { const t = level.get(x, y); if (predicate(t)) return { x, y, t }; }
    return null;
  }
}
