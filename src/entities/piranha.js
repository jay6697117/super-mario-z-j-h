// 食人花：从管道中上下起伏，玩家靠近管口时缩回
import { TILE_SIZE } from '../constants.js';

export class Piranha {
  constructor(pipeCenterX, pipeTopY) {
    this.kind = 'piranha';
    this.w = 22; this.h = 26;
    this.x = pipeCenterX - this.w/2;
    this.baseY = pipeTopY - this.h; // 管口处
    this.y = this.baseY + 20; // 初始更低
    this.t = 0; // 时间相位
    this.period = 2.8; // 上下周期
    this.dead = false;
  }
  update(dt, physics, level, player) {
    this.t += dt;
    const phase = (Math.sin((this.t/this.period)*Math.PI*2)+1)/2; // 0~1
    // 玩家靠近管口则缩回：横向1格内，且玩家站在或靠近管口顶（玩家底部不高于管口顶+6px）
    const nearX = player && Math.abs((this.x+this.w/2) - (player.x+player.w/2)) < TILE_SIZE*1.0;
    const pipeTopY = this.baseY + this.h;
    const nearY = player && (player.y + player.h) <= (pipeTopY + 6);
    const offset = (nearX && nearY) ? 26 : 0;
    this.y = this.baseY + (1-phase)*18 + offset;
  }
}
