export class Particles {
  constructor(){ this.items=[]; }
  burstRect(x,y,w,h,color='#eab308',count=8,speed=220){ for(let i=0;i<count;i++){ const ang=(Math.PI*2*i)/count; const vx=Math.cos(ang)*(speed*(0.6+Math.random()*0.6)); const vy=Math.sin(ang)*(speed*(0.6+Math.random()*0.6)); this.items.push({x:x+w/2,y:y+h/2,vx,vy:vy-120,life:0.5,color}); } }
  spark(x,y,color='#f59e0b',count=10){ for(let i=0;i<count;i++){ this.items.push({x,y,vx:(Math.random()-0.5)*260,vy:(Math.random()-0.8)*260,life:0.25+Math.random()*0.2,color}); } }
  update(dt){ for(const p of this.items){ p.vy+=1200*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; } this.items=this.items.filter(p=>p.life>0); }
  draw(ctx,camera){ ctx.save(); for(const p of this.items){ const sx=Math.floor(p.x-camera.x); const sy=Math.floor(p.y-camera.y); ctx.fillStyle=p.color; ctx.fillRect(sx,sy,3,3);} ctx.restore(); }
}

