// 火焰喷口：周期性喷火，接触即受伤/死亡
export class FlameSpout {
  constructor(x,y,dir='up',length=48,period=2.0,on=0.8){
    this.kind='flame-spout'; this.x=x; this.y=y; this.w=16; this.h=16;
    this.dir=dir; this.length=length; this.period=period; this.on=on; this.t=0;
  }
  active(){ const p=(this.t%this.period); return p < this.on; }
  rect(){ if(!this.active()) return null; if(this.dir==='up') return {x:this.x+6,y:this.y-this.length,w:4,h:this.length}; if(this.dir==='down') return {x:this.x+6,y:this.y+this.h,w:4,h:this.length}; if(this.dir==='left') return {x:this.x-this.length,y:this.y+6,w:this.length,h:4}; return {x:this.x+this.w,y:this.y+6,w:this.length,h:4}; }
  update(dt){ this.t+=dt; }
}

