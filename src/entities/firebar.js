// 火条：绕支点旋转的火球链
export class FireBar {
  constructor(x, y, segments = 6, speed = 2) {
    this.kind = 'firebar';
    this.x = x; // 支点像素坐标
    this.y = y;
    this.w = 0; this.h = 0; // 不参与AABB
    this.segments = segments;
    this.speed = speed; // 弧度/秒
    this.angle = 0;
    this.dead = false;
  }
  update(dt) { this.angle += this.speed * dt; }
  // 返回每个火球圆心（像素）与半径
  balls(tileSize) {
    const out = [];
    for (let i = 1; i <= this.segments; i++) {
      const r = i * (tileSize * 0.28);
      out.push({ cx: this.x + Math.cos(this.angle) * r, cy: this.y + Math.sin(this.angle) * r, radius: tileSize * 0.18 });
    }
    return out;
  }
}

