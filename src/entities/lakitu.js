// Lakitu：在玩家上方飘移，周期抛出 Spiny
import { Spiny } from './spiny.js';

export class Lakitu {
  constructor(x,y){ this.kind='lakitu'; this.x=x; this.y=y; this.w=26; this.h=24; this.vx=40; this.vy=0; this.t=0; this.dead=false; this.dropCd=1.8; this._drop=0; }
  update(dt, physics, level, player, entities){ if(this.dead) return; this.t+=dt; this._drop+=dt;
    // 追随玩家X，保持一定高度
    if (player){ const targetX = player.x + player.w/2 + 80*Math.sin(this.t*0.7); const dx = targetX - (this.x+this.w/2); this.vx = Math.max(-80, Math.min(80, dx*1.2)); }
    const nextX = this.x + this.vx*dt; this.x = Math.max(0, Math.min(nextX, level.cols*32 - this.w));
    // 高度缓动
    const targetY = Math.max(32, (player? player.y-90 : this.y)); this.y += Math.max(-100, Math.min(100, (targetY - this.y))) * dt;
    // 抛 Spiny
    if (this._drop>=this.dropCd){ this._drop=0; entities?.push(new Spiny(this.x + this.w/2 - 10, this.y + this.h)); }
  }
}

