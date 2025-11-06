// 食人花：从管道中上下起伏，玩家靠近管口时不露头（阻塞）
import { TILE_SIZE } from '../constants.js';

export class Piranha {
  constructor(pipeCenterX, pipeTopY, opts = null) {
    this.kind = 'piranha';
    this.w = 22; this.h = 26;
    this.x = pipeCenterX - this.w/2;
    this.baseY = pipeTopY - this.h; // 管口顶沿处（完全露头时的 y）
    this.y = this.baseY + 22; // 初始更低
    // 状态机：down → rise → holdUp → fall → holdDown → rise ...
    this.state = 'holdDown';
    this.progress = 0; // 0（完全缩回）~1（完全露头）
    this.upTime = 0.9;    // 上升时间
    this.downTime = 0.9;  // 下降时间
    this.holdUp = 0.6;    // 顶部停顿
    this.holdDown = 0.7;  // 底部停顿
    this.timer = this.holdDown;
    // 近距阻塞判定
    this.nearTilesX = 1.5;   // 管口左右 1.5 格内
    this.nearYOffset = 6;    // 玩家底部相对管口顶 6px 内
    this.dead = false;
    if (opts && typeof opts === 'object') {
      if (opts.upTime != null) this.upTime = Math.max(0.1, Number(opts.upTime) || this.upTime);
      if (opts.downTime != null) this.downTime = Math.max(0.1, Number(opts.downTime) || this.downTime);
      if (opts.holdUp != null) this.holdUp = Math.max(0, Number(opts.holdUp) || this.holdUp);
      if (opts.holdDown != null) this.holdDown = Math.max(0, Number(opts.holdDown) || this.holdDown);
      if (opts.nearTilesX != null) this.nearTilesX = Math.max(0.5, Number(opts.nearTilesX) || this.nearTilesX);
      if (opts.nearYOffset != null) this.nearYOffset = Math.max(0, Number(opts.nearYOffset) || this.nearYOffset);
    }
  }
  _playerBlocks(player){
    if (!player) return false;
    const centerX = this.x + this.w/2;
    const pCenterX = player.x + player.w/2;
    const nearX = Math.abs(centerX - pCenterX) < TILE_SIZE * this.nearTilesX;
    const pipeTopY = this.baseY + this.h;
    const nearY = (player.y + player.h) <= (pipeTopY + this.nearYOffset);
    return nearX && nearY;
  }
  update(dt, physics, level, player) {
    if (this.dead) return;
    // 若玩家靠近管口，强制向下并在底部停顿
    const blocked = this._playerBlocks(player);
    if (blocked) {
      this.state = 'down';
      // 加速下潜，避免“卡边缘”瞬间抖动
      this.progress = Math.max(0, this.progress - dt / (this.downTime * 0.6));
      if (this.progress === 0) { this.state = 'holdDown'; this.timer = this.holdDown; }
    } else {
      // 正常状态机
      if (this.state === 'holdDown') { this.timer -= dt; if (this.timer <= 0) { this.state = 'rise'; } }
      else if (this.state === 'rise') { this.progress += dt / this.upTime; if (this.progress >= 1){ this.progress = 1; this.state = 'holdUp'; this.timer = this.holdUp; } }
      else if (this.state === 'holdUp') { this.timer -= dt; if (this.timer <= 0) { this.state = 'fall'; } }
      else if (this.state === 'fall') { this.progress -= dt / this.downTime; if (this.progress <= 0){ this.progress = 0; this.state = 'holdDown'; this.timer = this.holdDown; } }
    }
    const travel = 20; // 上下行程
    this.y = this.baseY + (1 - this.progress) * travel;
  }
}
