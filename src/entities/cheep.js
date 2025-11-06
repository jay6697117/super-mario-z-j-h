// 水下鱼 Cheep Cheep：水平游动，轻微上下波动
export class Cheep {
  constructor(x, y, dir= -1){ this.kind='cheep'; this.x=x; this.y=y; this.w=24; this.h=18; this.vx=60*dir; this.vy=0; this.t=0; this.dead=false; }
  top(){return this.y;} bottom(){return this.y+this.h;} left(){return this.x;} right(){return this.x+this.w;}
  update(dt, physics, level){ if(this.dead) return; this.t += dt; // 水中不受重力
    // 轻微上下波动
    const amp = 18; this.vy = Math.sin(this.t*2.2) * 22;
    // 水平移动，撞墙换向
    const vx = this.vx*dt, vy = this.vy*dt;
    const beforeX=this.x; physics.collideAndSlideRect(this, vx, vy, level);
    if (Math.abs(this.x - beforeX) < Math.abs(vx)*0.5) this.vx = -this.vx;
  }
}

