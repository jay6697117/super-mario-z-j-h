// 水下乌贼 Blooper：缓慢上下漂移，间歇朝玩家上冲
export class Blooper {
  constructor(x,y){ this.kind='blooper'; this.x=x; this.y=y; this.w=22; this.h=24; this.vx=0; this.vy=0; this.t=0; this.dead=false; }
  top(){return this.y;} bottom(){return this.y+this.h;} left(){return this.x;} right(){return this.x+this.w;}
  update(dt, physics, level, player){ if(this.dead) return; this.t+=dt; const phase = Math.sin(this.t*1.6);
    // 漂移
    this.vx = Math.sin(this.t*0.8) * 20;
    // 每隔一段时间向玩家y方向轻推
    if (player) {
      const dy = (player.y - this.y);
      this.vy += Math.sign(dy) * 20 * dt;
      // 限制速度
      if (this.vy>60) this.vy=60; if (this.vy<-60) this.vy=-60;
    }
    const vx=this.vx*dt, vy=this.vy*dt; physics.collideAndSlideRect(this, vx, vy, level);
  }
}

