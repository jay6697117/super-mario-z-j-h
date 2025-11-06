export class Particles {
  constructor(){ this.items=[]; }
  burstRect(x,y,w,h,color='#eab308',count=8,speed=220){
    for(let i=0;i<count;i++){
      const ang=(Math.PI*2*i)/count; const vx=Math.cos(ang)*(speed*(0.6+Math.random()*0.6)); const vy=Math.sin(ang)*(speed*(0.6+Math.random()*0.6));
      this.items.push({type:'rect',x:x+w/2,y:y+h/2,vx,vy:vy-120,life:0.5,ttl:0.5,color});
    }
  }
  spark(x,y,color='#f59e0b',count=10){
    for(let i=0;i<count;i++){
      this.items.push({type:'rect',x,y,vx:(Math.random()-0.5)*260,vy:(Math.random()-0.8)*260,life:0.25+Math.random()*0.2,ttl:0.25+Math.random()*0.2,color});
    }
  }
  // 细灰尘：起跑/落地的小型尘土，向上缓慢飘散
  dust(x,y,color='#cbd5e1',count=8){
    for(let i=0;i<count;i++){
      const vx=(Math.random()-0.5)*120; const vy=(-40 - Math.random()*120);
      this.items.push({type:'rect',x,y,vx,vy,life:0.35+Math.random()*0.25,ttl:0.6,color});
    }
  }
  text(x,y,content,color='#ffffff',life=0.9){
    // 轻微横向摆动 + 透明度按life渐变
    this.items.push({type:'text',x,y,vx:0,vy:-60,life,ttl:life,color,text:content,phase:Math.random()*Math.PI*2,sway:6});
  }
  // 擦痕短线：急停/起跑时地面短线粒子
  skid(x,y,dir=1,count=6,color='#9ca3af'){
    for(let i=0;i<count;i++){
      const w=6+Math.random()*4, h=2; const off=(Math.random()-0.5)*6;
      this.items.push({type:'rect',x:x+off,y:y, vx:dir*20, vy:-20-Math.random()*30, life:0.22+Math.random()*0.18, ttl:0.4, color, w, h});
    }
  }
  update(dt){
    for(const p of this.items){
      // 文本不受重力或受较小重力
      const g = (p.type==='text') ? 0 : 1200;
      p.vy += g*dt; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
    }
    this.items=this.items.filter(p=>p.life>0);
  }
  draw(ctx,camera){
    ctx.save();
    for(const p of this.items){
      const sx=Math.floor(p.x-camera.x); const sy=Math.floor(p.y-camera.y);
      if(p.type==='text'){
        const alpha = Math.max(0, Math.min(1, p.life / (p.ttl||1)));
        ctx.globalAlpha = alpha;
        const sway = p.sway||0; const dx = Math.sin(((p.ttl||1)-(p.life||0))*6 + (p.phase||0)) * sway;
        ctx.fillStyle=p.color; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(p.text, sx+dx, sy);
        ctx.globalAlpha = 1;
      } else {
        const rw = p.w||3, rh=p.h||3;
        ctx.fillStyle=p.color; ctx.fillRect(sx,sy,rw,rh);
      }
    }
    ctx.restore();
  }
}
