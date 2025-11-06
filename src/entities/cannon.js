// 炮台：周期性发射子弹比尔
import { Bill } from './bill.js';

export class Cannon {
  constructor(x,y,dir=-1,period=2.2){ this.kind='cannon'; this.x=x; this.y=y; this.w=32; this.h=32; this.dir=dir; this.period=period; this.t=0; this.dead=false; this.range=320; this.maxActive=2; }
  update(dt, physics, level, player, entities){ if(this.dead) return; this.t+=dt;
    // 视距与数量限制
    const inRange = player ? Math.abs((player.x+player.w/2) - (this.x+this.w/2)) <= (this.range||320) : true;
    let bills=0; if (Array.isArray(entities)) for(const e of entities){ if(e.kind==='bill') bills++; }
    if(this.t>=this.period && inRange && bills < (this.maxActive||2)){
      this.t=0; const bx = this.dir<0? this.x-18 : this.x+this.w; const by = this.y + this.h*0.35; entities?.push(new Bill(bx, by, this.dir));
    }
  }
}
