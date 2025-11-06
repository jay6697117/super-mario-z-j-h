// Lakitu：在玩家上方飘移，周期抛出 Spiny
import { Spiny } from './spiny.js';

export class Lakitu {
  constructor(x,y){
    this.kind='lakitu'; this.x=x; this.y=y; this.w=26; this.h=24;
    this.vx=40; this.vy=0; this.t=0; this.dead=false;
    this.dropCd=1.8; this._drop=0; this._nextDrop=null; // 下次投掷间隔（含随机抖动）
    this.maxSpinyActive = 3;  // 同屏 Spiny 上限
    this.dropActiveRangeTiles = 18; // 与玩家水平距离小于 N 格时才投掷
  }
  update(dt, physics, level, player, entities){
    if(this.dead) return; this.t+=dt; this._drop+=dt;
    // 追随玩家X，保持一定高度
    if (player){
      const targetX = player.x + player.w/2 + 80*Math.sin(this.t*0.7);
      const dx = targetX - (this.x+this.w/2);
      this.vx = Math.max(-80, Math.min(80, dx*1.2));
    }
    const nextX = this.x + this.vx*dt; this.x = Math.max(0, Math.min(nextX, level.cols*32 - this.w));
    // 高度缓动
    const targetY = Math.max(32, (player? player.y-90 : this.y)); this.y += Math.max(-100, Math.min(100, (targetY - this.y))) * dt;
    // 抛 Spiny（节奏随机 + 上限 + 距离判断）
    const rangeOK = player ? Math.abs((this.x+this.w/2) - (player.x+player.w/2)) < this.dropActiveRangeTiles*32 : true;
    if (rangeOK){
      const nextCd = (this._nextDrop==null) ? this.dropCd : this._nextDrop;
      if (this._drop >= nextCd){
        const active = entities ? entities.reduce((n,e)=> n + ((e.kind==='spiny' && !e.dead)?1:0), 0) : 0;
        if (active < this.maxSpinyActive){
          this._drop = 0;
          // 下次间隔：0.8~1.3倍随机
          this._nextDrop = this.dropCd * (0.8 + Math.random()*0.5);
          const s = new Spiny(this.x + this.w/2 - 10, this.y + this.h);
          // 初始水平速度朝向玩家（弱化一些）
          if (player) s.vx = ( (player.x + player.w/2) >= (this.x + this.w/2) ) ? 40 : -40;
          entities?.push(s);
        } else {
          // 延迟检查时间，避免持续触发浪费
          this._drop = nextCd - 0.2;
        }
      }
    }
  }
}
