// Spiny（刺甲）：地面巡逻，不能被踩；被弹壳/子弹命中可消灭
export class Spiny {
  constructor(x,y){ this.kind='spiny'; this.x=x; this.y=y; this.w=24; this.h=20; this.vx=-60; this.vy=0; this.dead=false; this.animTime=0; }
  top(){return this.y;} bottom(){return this.y+this.h;} left(){return this.x;} right(){return this.x+this.w;}
  update(dt, physics, level){ if(this.dead) return; this.vy+=physics.gravity*dt; if(this.vy>physics.maxVy) this.vy=physics.maxVy; const vx=this.vx*dt, vy=this.vy*dt; const beforeX=this.x; physics.collideAndSlideRect(this,vx,vy,level); if(Math.abs(this.x-beforeX)<Math.abs(vx)*0.5) this.vx=-this.vx; const ahead=this.vx>0?Math.floor((this.right()+1)/32):Math.floor((this.left()-1)/32); const foot=Math.floor((this.bottom()+1)/32); const t=physics.tileAt(level,ahead,foot); if(!physics.isSolid(t)) this.vx=-this.vx; this.animTime+=dt; }
}

