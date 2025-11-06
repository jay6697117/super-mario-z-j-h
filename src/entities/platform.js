// 移动平台：水平/垂直往返，支持携带玩家
export class MovingPlatform {
  constructor(x, y, w = 48, h = 12, dir = 'h', range = 96, speed = 60) {
    this.kind = 'platform';
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.baseX = x; this.baseY = y;
    this.dir = dir; // 'h' | 'v'
    this.range = range; this.speed = speed;
    this.t = 0; this._lastX = x; this._lastY = y; this.dx = 0; this.dy = 0;
  }
  update(dt){
    this._lastX = this.x; this._lastY = this.y;
    const s = this.speed * dt;
    if (this.dir === 'h') {
      this.t += s; const off = (Math.sin(this.t / this.range) + 1) / 2; // 0~1 循环
      this.x = this.baseX + (off * 2 - 1) * this.range * 0.5;
    } else {
      this.t += s; const off = (Math.sin(this.t / this.range) + 1) / 2;
      this.y = this.baseY + (off * 2 - 1) * this.range * 0.5;
    }
    this.dx = this.x - this._lastX; this.dy = this.y - this._lastY;
  }
}

