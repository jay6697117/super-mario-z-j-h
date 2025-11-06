// 锤兄：巡逻、间歇跳跃并抛出锤子
export class HammerBro {
  constructor(x,y){ this.kind='hammer-bro'; this.x=x; this.y=y; this.w=26; this.h=30; this.vx=40; this.vy=0; this.dead=false; this.t=0; this.jumpCd=1.8; this.throwCd=1.2; this._jump=0; this._throw=0; this.facing=-1; }
  update(dt, physics, level, player, entities){ if(this.dead) return; this.t+=dt; this._jump+=dt; this._throw+=dt; this.vy += physics.gravity*dt; if(this.vy>physics.maxVy) this.vy=physics.maxVy;
    // 巡逻换向（碰壁/边缘退回）
    const beforeX=this.x; physics.collideAndSlideRect(this, this.vx*dt, this.vy*dt, level); if (Math.abs(this.x-beforeX)<Math.abs(this.vx*dt)*0.5) this.vx=-this.vx; this.facing = this.vx>=0?1:-1;
    // 跳跃
    if (this._jump>=this.jumpCd){ this._jump=0; if (this.bottom){} this.vy = -480; }
    // 抛锤
    if (this._throw>=this.throwCd){ this._throw=0; const dir = this.facing; const hx = this.x + (dir>0? this.w : -6); const hy = this.y; entities?.push(new Hammer(hx, hy, dir)); }
  }
}

export class Hammer {
  constructor(x,y,dir=1){ this.kind='hammer'; this.x=x; this.y=y; this.w=10; this.h=10; this.vx=120*dir; this.vy=-360; this.dead=false; this.life=3.5; }
  update(dt, physics, level){ if(this.dead) return; this.life-=dt; if(this.life<=0) { this.dead=true; return; } this.vy += 1200*dt; const nextX=this.x+this.vx*dt, nextY=this.y+this.vy*dt; // 撞墙或地面即消失
    const col = Math.floor((nextX + (this.vx>0?this.w:0))/32); const row = Math.floor((nextY + this.h)/32); if (physics.isSolid(physics.tileAt(level,col,row))) { this.dead=true; return; }
    this.x=nextX; this.y=nextY;
  }
}

