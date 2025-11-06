// 子弹比尔（Bullet Bill）：炮台发射的飞弹
export class Bill {
  constructor(x,y,dir=-1){ this.kind='bill'; this.x=x; this.y=y; this.w=28; this.h=18; this.vx=160*dir; this.vy=0; this.dead=false; }
  update(dt, physics, level){ if(this.dead) return; const nextX=this.x+this.vx*dt, nextY=this.y; // 水平直线
    // 撞墙即消失
    const col = Math.floor((nextX + (this.vx>0?this.w:0))/32);
    const row = Math.floor((this.y + this.h/2)/32);
    if (physics.isSolid(physics.tileAt(level, col, row))) { this.dead=true; return; }
    this.x=nextX; this.y=nextY;
  }
}

