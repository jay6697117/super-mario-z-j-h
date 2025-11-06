import { TILE_SIZE } from '../constants.js';

export class Player {
  constructor(x,y){ this.kind='player'; this.x=x; this.y=y; this.w=24; this.h=28; this.vx=0; this.vy=0; this.accel=1400; this.maxSpeed=220; this.jumpSpeed=620; this.friction=1400; this.grounded=false; this.facing=1; this.animTime=0; this.powered=false; this.invincibleTime=0; this.smallSize={w:24,h:28}; this.bigSize={w:28,h:34}; this.respawnX=x; this.respawnY=y; this.pose='idle'; this.poseTime=0; this._poseLock=0; this.hurtTime=0; this.prevVx=0; }
  left(){return this.x;} right(){return this.x+this.w;} top(){return this.y;} bottom(){return this.y+this.h;}
  update(dt,input,physics,level){
    const boost=input.run?1.15:1.0;
    const beforeVx = this.vx;
    // 水平加减速
    if(input.left&&!input.right) this.vx-=this.accel*boost*dt; else if(input.right&&!input.left) this.vx+=this.accel*boost*dt; else { if(this.vx>0) this.vx=Math.max(0,this.vx-this.friction*dt); else if(this.vx<0) this.vx=Math.min(0,this.vx+this.friction*dt); }
    const maxSpd=this.maxSpeed*(input.run?1.2:1.0);
    this.vx=Math.max(-maxSpd,Math.min(maxSpd,this.vx));
    if(this.vx>10) this.facing=1; else if(this.vx<-10) this.facing=-1;
    // 重力/跳跃
    this.vy+=physics.gravity*dt; if(this.vy>physics.maxVy) this.vy=physics.maxVy; if(input.jumpPressed&&this.grounded){ this.vy=-this.jumpSpeed; this.grounded=false; }
    const res=physics.collideAndSlideRect(this,this.vx*dt,this.vy*dt,level);
    this.grounded=res.onGround; this.lastHeadHit=res.headHit;
    if(this.grounded){ this.respawnX=this.x; this.respawnY=this.y; }
    this.animTime+=dt; if(this.invincibleTime>0) this.invincibleTime-=dt; if(this.hurtTime>0) this.hurtTime-=dt;
    if(this.x<0) this.x=0; if(this.y<0) this.y=0; const maxX=level.cols*TILE_SIZE-this.w; const maxY=level.rows*TILE_SIZE-this.h; this.x=Math.min(this.x,maxX); this.y=Math.min(this.y,maxY);

    // 姿态机
    this.poseTime += dt; if (this._poseLock>0) this._poseLock -= dt;
    if (this.hurtTime>0) { this.pose='hurt'; this.prevVx=this.vx; return; }
    if (!this.grounded) { this.pose='jump'; this.prevVx=this.vx; return; }
    const speed = Math.abs(this.vx);
    if (this._poseLock<=0) {
      if (Math.abs(beforeVx) > 150 && Math.sign(beforeVx) !== Math.sign(this.vx)) { this.pose='brake'; this.poseTime=0; this._poseLock=0.18; }
      else if (Math.abs(beforeVx) < 20 && speed > 80) { this.pose='start'; this.poseTime=0; this._poseLock=0.12; }
      else if (speed < 10) { this.pose='idle'; this.poseTime=0; }
      else { this.pose='run'; }
    }
    this.prevVx=this.vx;
  }
  setPowered(on){ const was=this.powered; this.powered=!!on; const target=this.powered?this.bigSize:this.smallSize; const oldH=this.h; this.w=target.w; this.h=target.h; this.y-=this.h-oldH; if(!was&&this.powered){ this.maxSpeed=280; this.jumpSpeed=700; } if(was&&!this.powered){ this.maxSpeed=220; this.jumpSpeed=620; this.hurtTime=0.4; this.pose='hurt'; this._poseLock=0.2; } }
  respawnAtSaved(){ this.x=this.respawnX; this.y=this.respawnY; this.vx=0; this.vy=0; }
  hurt(duration=0.4){ this.hurtTime=duration; this.pose='hurt'; this._poseLock=Math.max(this._poseLock, duration*0.5); }
}
