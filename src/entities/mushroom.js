import { TILE_SIZE } from '../constants.js';

export class Mushroom { constructor(x,y){ this.kind='mushroom'; this.x=x; this.y=y; this.w=26; this.h=24; this.vx=40; this.vy=0; this.dead=false; }
  update(dt,physics,level){ if(this.dead) return; this.vy+=physics.gravity*dt; if(this.vy>physics.maxVy) this.vy=physics.maxVy; const vx=this.vx*dt, vy=this.vy*dt; const beforeX=this.x; physics.collideAndSlideRect(this,vx,vy,level); if(Math.abs(this.x-beforeX)<Math.abs(vx)*0.5) this.vx=-this.vx; }
}

