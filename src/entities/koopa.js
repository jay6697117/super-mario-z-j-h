import { TILE_SIZE } from '../constants.js';

export class Koopa { constructor(x,y){ this.kind='koopa'; this.x=x; this.y=y; this.w=28; this.h=28; this.vx=-40; this.vy=0; this.dead=false; }
  top(){return this.y;} bottom(){return this.y+this.h;} left(){return this.x;} right(){return this.x+this.w;}
  update(dt,physics,level){ if(this.dead) return; const beforeX=this.x; this.vy+=physics.gravity*dt; physics.collideAndSlideRect(this,this.vx*dt,this.vy*dt,level); if(Math.abs(this.x-beforeX)<Math.abs(this.vx*dt)*0.5) this.vx=-this.vx; const ahead=this.vx>0?Math.floor((this.right()+1)/TILE_SIZE):Math.floor((this.left()-1)/TILE_SIZE); const foot=Math.floor((this.bottom()+1)/TILE_SIZE); if(!physics.isSolid(physics.tileAt(level,ahead,foot))) this.vx=-this.vx; }
}

export class Shell { constructor(x,y){ this.kind='shell'; this.x=x; this.y=y; this.w=26; this.h=22; this.vx=0; this.vy=0; this.dead=false; }
  update(dt,physics,level){ this.vy+=physics.gravity*dt; physics.collideAndSlideRect(this,this.vx*dt,this.vy*dt,level); }
}

