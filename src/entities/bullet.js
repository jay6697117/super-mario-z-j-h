import { TILE_SIZE } from '../constants.js';

export class Bullet { constructor(x,y,dir=1){ this.kind='bullet'; this.x=x; this.y=y; this.w=12; this.h=12; this.vx=260*dir; this.vy=-80; this.dead=false; this.life=4.0; }
  update(dt,physics,level){ if(this.dead) return; this.life-=dt; if(this.life<=0){ this.dead=true; return; }
    // 重力+弹跳火球：遇地反弹，撞墙消失
    this.vy += 1200*dt;
    const nextX=this.x+this.vx*dt; const nextY=this.y+this.vy*dt;
    // 墙体检查
    const colWall = Math.floor((nextX + (this.vx>0?this.w:0))/TILE_SIZE);
    const rowMid  = Math.floor((this.y + this.h/2)/TILE_SIZE);
    if (physics.isSolid(physics.tileAt(level, colWall, rowMid))) { this.dead=true; return; }
    // 地面检查（向下）
    const colMid = Math.floor((nextX + this.w/2)/TILE_SIZE);
    const rowDown = Math.floor((nextY + this.h)/TILE_SIZE);
    if (this.vy>0 && physics.isSolid(physics.tileAt(level, colMid, rowDown))) {
      // 反弹
      this.vy = -Math.abs(this.vy)*0.7;
      this.y = rowDown*TILE_SIZE - this.h - 0.01;
      this.x = nextX;
      return;
    }
    this.x=nextX; this.y=nextY;
  }
}
