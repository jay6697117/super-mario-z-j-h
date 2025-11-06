import { TILE_SIZE } from '../constants.js';

export class Enemy { // 简化版 goomba
  constructor(x,y){ this.kind='enemy'; this.x=x; this.y=y; this.w=28; this.h=28; this.vx=-60; this.vy=0; this.dead=false; this.animTime=0; }
  top(){return this.y;} bottom(){return this.y+this.h;} left(){return this.x;} right(){return this.x+this.w;}
  update(dt,physics,level){ if(this.dead) return; this.vy+=physics.gravity*dt; if(this.vy>physics.maxVy) this.vy=physics.maxVy; const vx=this.vx*dt, vy=this.vy*dt; const beforeX=this.x; physics.collideAndSlideRect(this,vx,vy,level); if(Math.abs(this.x-beforeX)<Math.abs(vx)*0.5) this.vx=-this.vx; const ahead=this.vx>0?Math.floor((this.right()+1)/TILE_SIZE):Math.floor((this.left()-1)/TILE_SIZE); const foot=Math.floor((this.bottom()+1)/TILE_SIZE); const t=physics.tileAt(level,ahead,foot); if(!physics.isSolid(t)) this.vx=-this.vx; this.animTime+=dt; }
}

