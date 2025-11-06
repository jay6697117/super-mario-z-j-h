export class Star { constructor(x,y){ this.kind='star'; this.x=x; this.y=y; this.w=20; this.h=20; this.vy=-150; this.life=10; this.dead=false; }
  update(dt){ this.y+=this.vy*dt; this.vy+=600*dt; this.life-=dt; if(this.life<=0) this.dead=true; }
}

