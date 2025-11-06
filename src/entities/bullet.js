import { TILE_SIZE } from '../constants.js';

export class Bullet { constructor(x,y,dir=1){ this.kind='bullet'; this.x=x; this.y=y; this.w=12; this.h=12; this.vx=420*dir; this.vy=0; this.dead=false; this.life=2.5; }
  update(dt,physics,level){ if(this.dead) return; this.life-=dt; if(this.life<=0){ this.dead=true; return; } const nextX=this.x+this.vx*dt; const nextY=this.y+this.vy*dt; const col=Math.floor((nextX+(this.vx>0?this.w:0))/TILE_SIZE); const row=Math.floor((nextY+this.h/2)/TILE_SIZE); const t=physics.tileAt(level,col,row); if(physics.isSolid(t)){ this.dead=true; return; } this.x=nextX; this.y=nextY; }
}

