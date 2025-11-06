import { TILE_SIZE } from '../constants.js';

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas; this.ctx = ctx;
    this.camera = { x:0, y:0, w:canvas.width, h:canvas.height };
    this.world = { w:canvas.width, h:canvas.height };
    this._target = { x:0, y:0 };
    this._smooth = 8; // 摄像机缓动速度系数（越大越快）
  }
  setWorldSize(w,h){ this.world.w=w; this.world.h=h; }
  nudgeCamera(dx=0, dy=0){
    const maxX = Math.max(0, this.world.w - this.canvas.width);
    const maxY = Math.max(0, this.world.h - this.canvas.height);
    this._target.x = Math.max(0, Math.min(this._target.x + dx, maxX));
    this._target.y = Math.max(0, Math.min(this._target.y + dy, maxY));
    this.camera.x = Math.max(0, Math.min(this.camera.x + dx, maxX));
    this.camera.y = Math.max(0, Math.min(this.camera.y + dy, maxY));
  }
  cameraFollow(target){
    // 计算“目标相机位置”，不直接写入 camera，交由 updateCamera 缓动过去
    const deadLeft = Math.floor(this.canvas.width * 0.35);
    const deadRight = Math.floor(this.canvas.width * 0.35);
    const px = Math.floor(target.x + target.w / 2);
    let camX = this.camera.x;
    const leftBound = camX + deadLeft;
    const rightBound = camX + this.canvas.width - deadRight;
    if (px > rightBound) camX += (px - rightBound);
    else if (px < leftBound) camX -= (leftBound - px);
    // 边缘缓冲：避免到达世界边界时突跳
    camX = Math.max(0, Math.min(camX, Math.max(0, this.world.w - this.canvas.width)));

    // 垂直：以目标居中为主（可按需加入垂直死区）
    let camY = Math.floor(target.y + target.h / 2 - this.canvas.height / 2);
    camY = Math.max(0, Math.min(camY, Math.max(0, this.world.h - this.canvas.height)));

    this._target.x = camX;
    this._target.y = camY;
  }
  updateCamera(dt){
    // 对 camera 进行 LERP 缓动到 target，限制 dt 以避免突变
    const clamp01 = (v)=> v < 0 ? 0 : (v > 1 ? 1 : v);
    const lerp = (a,b,t)=> a + (b - a) * t;
    const safeDt = Math.min(0.05, Math.max(0, dt||0));
    const t = clamp01(safeDt * (this._smooth || 8));

    const nextX = lerp(this.camera.x, this._target.x, t);
    const nextY = lerp(this.camera.y, this._target.y, t);
    const maxX = Math.max(0, this.world.w - this.canvas.width);
    const maxY = Math.max(0, this.world.h - this.canvas.height);
    this.camera.x = Math.max(0, Math.min(nextX, maxX));
    this.camera.y = Math.max(0, Math.min(nextY, maxY));
    this._tick = (this._tick || 0) + (dt || 0);
  }
  clear(){ this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  drawBackground(level){ const ctx=this.ctx; const theme = (level?.theme) || (level?.activeRoom==='sub' ? 'underground' : 'sky');
    if (theme === 'castle') { const g=ctx.createLinearGradient(0,0,0,this.canvas.height); g.addColorStop(0,'#1f2937'); g.addColorStop(1,'#111827'); ctx.fillStyle=g; ctx.fillRect(0,0,this.canvas.width,this.canvas.height); }
    else if (theme === 'water') { const g=ctx.createLinearGradient(0,0,0,this.canvas.height); g.addColorStop(0,'#0ea5e9'); g.addColorStop(1,'#0c4a6e'); ctx.fillStyle=g; ctx.fillRect(0,0,this.canvas.width,this.canvas.height); ctx.fillStyle='#ffffff20';
      // 去随机化：预生成固定“气泡”位置，确保渲染快照可重复
      if (!this._waterBubbles || this._wbW!==this.canvas.width || this._wbH!==this.canvas.height){
        this._waterBubbles=[]; this._wbW=this.canvas.width; this._wbH=this.canvas.height;
        for(let i=0;i<12;i++){ const r=6+((i*13)%8); const x=(i*83)%this.canvas.width; const y=(i*47)%this.canvas.height; this._waterBubbles.push({x,y,r}); }
      }
      for(const b of this._waterBubbles){ ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); }
    }
    else if (theme === 'underground') { const g=ctx.createLinearGradient(0,0,0,this.canvas.height); g.addColorStop(0,'#0ea5e9'); g.addColorStop(1,'#0369a1'); ctx.fillStyle=g; ctx.fillRect(0,0,this.canvas.width,this.canvas.height); }
    else { /* sky */ }
    if (theme === 'sky') { const cx=Math.round(this.camera.x); const cy=Math.round(this.camera.y); ctx.save(); ctx.translate(Math.round(-cx*0.2),Math.round(-cy*0.2)); ctx.fillStyle='#ffffff80'; for(let i=0;i<6;i++){ const x=200+i*300; const y=100+(i%3)*40; this._cloud(x,y);} ctx.restore(); ctx.save(); ctx.translate(Math.round(-cx*0.4),Math.round(-cy*0.1)); ctx.fillStyle='#7fbf5b'; for(let i=0;i<8;i++){ const x=100+i*400; const y=this.canvas.height-80; this._hill(x,y);} ctx.restore(); }
  }
  drawLevel(level){ const ctx=this.ctx; const c=this.camera; const cx=Math.round(c.x); const cy=Math.round(c.y); const startCol=Math.floor(cx/TILE_SIZE); const endCol=Math.min(level.cols-1,Math.floor((cx+c.w)/TILE_SIZE)); const startRow=Math.floor(cy/TILE_SIZE); const endRow=Math.min(level.rows-1,Math.floor((cy+c.h)/TILE_SIZE)); for(let r=startRow;r<=endRow;r++){ for(let col=startCol; col<=endCol; col++){ const t=level.get(col,r); if(t==='-') continue; const x=col*TILE_SIZE-cx; const y=r*TILE_SIZE-cy; const rx=Math.round(x), ry=Math.round(y); if(t==='#'||t==='B'||t==='N'){ ctx.fillStyle=t==='#'?'#7c4f1d':'#a16207'; ctx.fillRect(rx,ry,TILE_SIZE,TILE_SIZE); ctx.strokeStyle='#00000033'; ctx.lineWidth=2; ctx.strokeRect(rx+1,ry+1,TILE_SIZE-2,TILE_SIZE-2); if(t==='N'){ ctx.fillStyle='#eab30822'; ctx.fillRect(rx+6,ry+6,TILE_SIZE-12,TILE_SIZE-12);} } else if (t==='F'){ // 旗杆与旗帜飘动
        const poleX = Math.round(x + TILE_SIZE*0.45), poleTop = Math.round(y - TILE_SIZE*3);
        ctx.fillStyle='#14532d'; ctx.fillRect(poleX, poleTop, 4, TILE_SIZE*4);
        const extra = this._flagWaveExtra || 0;
        const wave = Math.sin((this._tick||0)*2 + col*0.3) * (3 + extra);
        ctx.fillStyle='#16a34a'; ctx.beginPath(); ctx.moveTo(poleX+4, poleTop); ctx.lineTo(poleX+4+24+wave, poleTop+12); ctx.lineTo(poleX+4, poleTop+24); ctx.closePath(); ctx.fill();
      } else if (t==='Q' || t==='M'){ ctx.fillStyle= t==='Q' ? '#f59e0b' : '#fbbf24'; ctx.fillRect(rx,ry,TILE_SIZE,TILE_SIZE); ctx.strokeStyle='#78350f'; ctx.strokeRect(rx+1,ry+1,TILE_SIZE-2,TILE_SIZE-2); ctx.fillStyle='#78350f'; ctx.font='bold 18px sans-serif'; ctx.fillText('?',rx+10,ry+22);} else if (t==='V'){ // 入口管道（渐变+内阴影）
        const g=ctx.createLinearGradient(rx,ry,rx,ry+TILE_SIZE); g.addColorStop(0,'#38a169'); g.addColorStop(1,'#166534'); ctx.fillStyle=g; ctx.fillRect(rx,ry,TILE_SIZE,TILE_SIZE);
        ctx.fillStyle='#15803d'; ctx.fillRect(rx,ry, TILE_SIZE, Math.round(TILE_SIZE*0.25));
        // 圆角内阴影（按 TILE_SIZE 比例）
        ctx.fillStyle='rgba(0,0,0,0.20)'; ctx.beginPath(); ctx.ellipse(rx+TILE_SIZE/2, ry+Math.round(TILE_SIZE*0.3), TILE_SIZE*0.35, Math.max(3, TILE_SIZE*0.15), 0, 0, Math.PI*2); ctx.fill();
      } else if (t==='X'){ // 出口管道（渐变+上沿暗影）
        const g2=ctx.createLinearGradient(rx,ry,rx,ry+TILE_SIZE); g2.addColorStop(0,'#166534'); g2.addColorStop(1,'#16a34a'); ctx.fillStyle=g2; ctx.fillRect(rx,ry,TILE_SIZE,TILE_SIZE);
        const inset=Math.round(TILE_SIZE*0.12);
        ctx.fillStyle='#16a34a'; ctx.fillRect(rx+inset,ry+inset,TILE_SIZE-inset*2,TILE_SIZE-inset*2);
        ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(rx+inset,ry+inset,TILE_SIZE-inset*2,Math.round(TILE_SIZE*0.12));
        ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(rx+TILE_SIZE/2, ry+Math.round(TILE_SIZE*0.22), TILE_SIZE*0.32, Math.max(3, TILE_SIZE*0.12), 0, 0, Math.PI*2); ctx.fill();
      } else if (t==='A'){ // 斧头
        ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.arc(rx+TILE_SIZE/2, ry+TILE_SIZE/2, 10, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#1f2937'; ctx.fillRect(rx+TILE_SIZE/2-2, ry+2, 4, TILE_SIZE-4);
      } else if (t==='K') { // checkpoint flag tile
        ctx.fillStyle='#f43f5e'; ctx.fillRect(rx+TILE_SIZE*0.45, ry-12, 4, TILE_SIZE+12);
        ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(rx+TILE_SIZE*0.45+4, ry-12);
        ctx.lineTo(rx+TILE_SIZE*0.45+4+18, ry-6);
        ctx.lineTo(rx+TILE_SIZE*0.45+4, ry);
        ctx.closePath(); ctx.fill();
      } } } }
  drawEntity(ent){
    const {x,y,w,h}=ent; const cx=Math.round(this.camera.x); const cy=Math.round(this.camera.y); const sx=Math.round(x-cx); const sy=Math.round(y-cy); const ctx=this.ctx;
    // 可见性裁剪（完全离屏直接跳过绘制）；
    // 对于 w/h 为 0 的复合实体（如 firebar）不做矩形裁剪
    if (w > 0 && h > 0) {
      if (sx + w < 0 || sy + h < 0 || sx > this.canvas.width || sy > this.canvas.height) return;
    }
    if(ent.kind==='player'){ this._drawPlayer(ctx,sx,sy,w,h,ent); }
    else if(ent.kind==='enemy'){ // Goomba 风格
      const t=(ent.animTime||0)*10; const bob=Math.sin(t*0.4)*1.2;
      ctx.fillStyle='#8b5e34';
      ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h*0.62+bob, w*0.48, h*0.42, 0, 0, Math.PI*2); ctx.fill();
      // 脚
      ctx.fillStyle='#5b3b1e'; ctx.fillRect(sx+3, sy+h-6, 8, 4); ctx.fillRect(sx+w-11, sy+h-6, 8, 4);
      // 眼睛
      ctx.fillStyle='#fff'; ctx.fillRect(sx+w*0.32, sy+h*0.5, 4, 6); ctx.fillRect(sx+w*0.56, sy+h*0.5, 4, 6);
      ctx.fillStyle='#1f2937'; ctx.fillRect(sx+w*0.34, sy+h*0.53, 2, 3); ctx.fillRect(sx+w*0.58, sy+h*0.53, 2, 3);
    }
    else if(ent.kind==='coin'||ent.kind==='reward-coin'){
      const g=ctx.createRadialGradient(sx+w*0.35,sy+h*0.35,2,sx+w/2,sy+h/2,w/2);
      g.addColorStop(0,'#fff59e'); g.addColorStop(0.6,'#facc15'); g.addColorStop(1,'#d97706');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(sx+w/2,sy+h/2,w/2,h/2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff7'; ctx.fillRect(sx+w*0.28, sy+h*0.25, 6, 2);
      ctx.strokeStyle='#92400e'; ctx.stroke();
    }
    else if(ent.kind==='mushroom'){
      // 伞帽+白点
      ctx.fillStyle='#16a34a'; ctx.beginPath(); ctx.arc(sx+w/2,sy+h*0.55,w*0.55,Math.PI,0); ctx.fill();
      ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.arc(sx+w*0.38, sy+h*0.5, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(sx+w*0.62, sy+h*0.5, 3, 0, Math.PI*2); ctx.fill();
      // 柄
      ctx.fillStyle='#fef3c7'; ctx.fillRect(sx+w*0.34,sy+h*0.55,w*0.32,h*0.35);
    }
    else if(ent.kind==='flower'){
      // 花瓣+花心+茎叶
      ctx.fillStyle='#ef4444'; for(let i=0;i<4;i++){ const a=i*Math.PI/2; ctx.beginPath(); ctx.ellipse(sx+w/2+Math.cos(a)*6, sy+h/2+Math.sin(a)*6, w*0.22, h*0.22, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(sx+w/2, sy+h/2, w*0.18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#16a34a'; ctx.fillRect(sx+w*0.47, sy+h*0.55, w*0.06, h*0.4);
      ctx.beginPath(); ctx.moveTo(sx+w*0.47, sy+h*0.7); ctx.quadraticCurveTo(sx+w*0.3, sy+h*0.65, sx+w*0.25, sy+h*0.78); ctx.lineWidth=3; ctx.strokeStyle='#16a34a'; ctx.stroke();
    }
    else if(ent.kind==='star'){ ctx.fillStyle='#fcd34d'; ctx.beginPath(); for(let i=0;i<5;i++){ const a=(i*72-90)*Math.PI/180; const r=w/2; const px=sx+w/2+Math.cos(a)*r; const py=sy+h/2+Math.sin(a)*r; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); const a2=a+36*Math.PI/180; const r2=r*0.5; ctx.lineTo(sx+w/2+Math.cos(a2)*r2, sy+h/2+Math.sin(a2)*r2);} ctx.closePath(); ctx.fill(); }
    else if(ent.kind==='piranha'){
      ctx.fillStyle='#10b981'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h*0.55, w*0.42, h*0.45, 0, 0, Math.PI*2); ctx.fill();
      // 嘴与齿
      ctx.fillStyle='#ecfeff'; ctx.fillRect(sx+w*0.25, sy+h*0.4, w*0.5, 4);
      ctx.fillStyle='#064e3b'; ctx.fillRect(sx+4, sy+h-6, w-8, 4);
    }
    else if(ent.kind==='bullet'){
      ctx.fillStyle='#111827'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h/2, w*0.55, h*0.45, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.fillRect(sx+w*0.58, sy+h*0.42, 6, 6); ctx.fillStyle='#000'; ctx.fillRect(sx+w*0.6, sy+h*0.45, 3, 3);
      ctx.fillStyle='#e11d48'; ctx.fillRect(sx+2, sy+3, 6, h-6);
    }
    else if(ent.kind==='koopa'||ent.kind==='shell'){
      // 壳体
      ctx.fillStyle='#16a34a'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h*0.62, w*0.48, h*0.36, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle='#064e3b'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx+4, sy+h*0.62); ctx.lineTo(sx+w-4, sy+h*0.62); ctx.stroke();
      if (ent.kind==='koopa'){ ctx.fillStyle='#fef3c7'; ctx.fillRect(sx+w*0.42, sy+h*0.35, 6, 8); }
    }
    else if(ent.kind==='firebar'){ const balls=ent.balls(TILE_SIZE); ctx.fillStyle='#f97316'; for(const b of balls){ const bx=Math.round(b.cx-cx), by=Math.round(b.cy-cy); ctx.beginPath(); ctx.arc(bx,by,b.radius,0,Math.PI*2); ctx.fill(); } }
    else if(ent.kind==='cheep'){ ctx.fillStyle='#38bdf8'; ctx.beginPath(); ctx.ellipse(sx+w*0.5, sy+h*0.55, w*0.45, h*0.35, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#0ea5e9'; ctx.beginPath(); ctx.moveTo(sx+4, sy+h*0.55); ctx.lineTo(sx-2, sy+h*0.45); ctx.lineTo(sx-2, sy+h*0.65); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(sx+w*0.6, sy+h*0.48, 4, 4); ctx.fillStyle='#000'; ctx.fillRect(sx+w*0.62, sy+h*0.5, 2, 2); }
    else if(ent.kind==='blooper'){ ctx.fillStyle='#93c5fd'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h*0.45, w*0.4, h*0.35, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#93c5fd'; ctx.fillRect(sx+w*0.35, sy+h*0.6, w*0.1, h*0.2); ctx.fillRect(sx+w*0.55, sy+h*0.6, w*0.1, h*0.2); ctx.fillStyle='#1f2937'; ctx.fillRect(sx+w*0.42, sy+h*0.45, 2, 2); ctx.fillRect(sx+w*0.56, sy+h*0.45, 2, 2); }
    else if(ent.kind==='bill'){ ctx.fillStyle='#111827'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h/2, w*0.5, h*0.45, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(sx+w*0.6, sy+h*0.45, 5, 5); ctx.fillStyle='#000'; ctx.fillRect(sx+w*0.62, sy+h*0.47, 2, 2); }
    else if(ent.kind==='cannon'){ ctx.fillStyle='#334155'; ctx.fillRect(sx, sy, w, h); ctx.fillStyle='#111827'; ctx.fillRect(sx+ (ent.dir<0? 2: w-8), sy+8, 6, h-16); }
    else if(ent.kind==='lakitu'){ // 云+小人
      ctx.fillStyle='#fff'; this._cloud(sx+12, sy+8); ctx.fillStyle='#fef3c7'; ctx.fillRect(sx+4, sy+2, w-8, h-12); ctx.fillStyle='#22c55e'; ctx.fillRect(sx+6, sy+h-6, w-12, 4); }
    else if(ent.kind==='spiny'){ ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.ellipse(sx+w/2, sy+h*0.6, w*0.45, h*0.32, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; for(let i=0;i<5;i++){ const px=sx+4+i*(w-8)/4; ctx.beginPath(); ctx.moveTo(px, sy+h*0.45); ctx.lineTo(px+3, sy+h*0.53); ctx.lineTo(px-3, sy+h*0.53); ctx.closePath(); ctx.fill(); } }
    else if(ent.kind==='hammer-bro'){ ctx.fillStyle='#84cc16'; ctx.fillRect(sx+4, sy+2, w-8, h-10); ctx.fillStyle='#f59e0b'; ctx.fillRect(sx, sy+h-8, w, 8); }
    else if(ent.kind==='hammer'){ ctx.fillStyle='#9ca3af'; ctx.fillRect(sx+6, sy+2, 6, h-4); ctx.fillStyle='#4b5563'; ctx.fillRect(sx, sy+4, 10, 6); }
    else if(ent.kind==='platform'){ ctx.fillStyle='#94a3b8'; ctx.fillRect(sx, sy, w, h); ctx.fillStyle='#11182722'; ctx.fillRect(sx, sy, w, 3); }
    else if(ent.kind==='flame-spout'){ const r=ent.rect?.(); if(r){ const rx=Math.round(r.x- this.camera.x), ry=Math.round(r.y- this.camera.y); ctx.fillStyle='#ef4444'; ctx.fillRect(rx,ry,r.w,r.h); ctx.fillStyle='#fde68a'; ctx.fillRect(rx,ry,Math.max(2,Math.round(r.w*0.5)),Math.max(2,Math.round(r.h*0.5))); } }
  }
  _cloud(x,y){ const ctx=this.ctx; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.arc(x+18,y+6,16,0,Math.PI*2); ctx.arc(x+36,y,20,0,Math.PI*2); ctx.fill(); }
  _hill(x,y){ const ctx=this.ctx; ctx.beginPath(); ctx.moveTo(x-60,y); ctx.lineTo(x,y-80); ctx.lineTo(x+80,y); ctx.closePath(); ctx.fill(); }
  _drawPlayer(ctx,sx,sy,w,h,ent){
    const t=ent.animTime||0; const headH=h*0.35; const bodyH=h-headH;
    const pose = ent.pose || 'idle';
    // 身体倾斜与偏移
    let ox=0, oy=0; if(pose==='start') ox = ent.facing>=0 ? 2 : -2; else if (pose==='brake') ox = ent.facing>=0 ? -2 : 2; else if (pose==='hurt') oy = -1;
    // 地面阴影
    if (ent.grounded) { ctx.save(); ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(Math.round(sx+w/2), Math.round(sy+h-2), Math.max(6,w*0.35), 3, 0, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
    // 身体
    ctx.fillStyle='#dc2626'; ctx.fillRect(Math.round(sx+2+ox), Math.round(sy+headH+oy), w-4, bodyH-4);
    // 头部
    ctx.fillStyle='#f1c27d'; ctx.fillRect(Math.round(sx+4+ox), Math.round(sy+2+oy), w-8, headH-2);
    // 帽檐
    ctx.fillStyle='#b91c1c'; ctx.fillRect(Math.round(sx+2+ox), Math.round(sy+0+oy), w-4, headH*0.45);
    // 眼睛
    ctx.fillStyle='#1f2937'; const eyeX = ent.facing>=0 ? sx+w*0.65+ox : sx+w*0.3+ox; ctx.fillRect(Math.round(eyeX), Math.round(sy+headH*0.45+oy), 3, 4);
    // 臂/扣
    ctx.fillStyle='#2563eb';
    ctx.fillRect(Math.round(sx+w*0.28+ox), Math.round(sy+headH+2+oy), 4, bodyH-6);
    ctx.fillRect(Math.round(sx+w*0.68+ox), Math.round(sy+headH+2+oy), 4, bodyH-6);
    ctx.fillStyle='#facc15';
    ctx.fillRect(Math.round(sx+w*0.28+ox), Math.round(sy+headH+bodyH*0.45+oy), 3, 3);
    ctx.fillRect(Math.round(sx+w*0.68+ox), Math.round(sy+headH+bodyH*0.45+oy), 3, 3);
    // 腿
    ctx.fillStyle='#1f2937';
    if(!ent.grounded || pose==='jump' || pose==='slide'){
      ctx.fillRect(Math.round(sx+5+ox), Math.round(sy+h-10+oy), w*0.35, 4);
      ctx.fillRect(Math.round(sx+w-5-w*0.35+ox), Math.round(sy+h-10+oy), w*0.35, 4);
    } else if (pose==='start'){
      const k=3; ctx.fillRect(Math.round(sx+4+ox+k), Math.round(sy+h-6+oy), w*0.35, 4);
      ctx.fillRect(Math.round(sx+w-4-w*0.35+ox-k), Math.round(sy+h-6+oy), w*0.35, 4);
    } else if (pose==='brake'){
      const k=3; ctx.fillRect(Math.round(sx+4+ox-k), Math.round(sy+h-6+oy), w*0.35, 4);
      ctx.fillRect(Math.round(sx+w-4-w*0.35+ox+k), Math.round(sy+h-6+oy), w*0.35, 4);
    } else {
      const run=Math.min(1, Math.abs(ent.vx||0)/(ent.maxSpeed||200)); const swing=Math.sin(t*20)*3*run;
      ctx.fillRect(Math.round(sx+4+ox+swing), Math.round(sy+h-6+oy), w*0.35, 4);
      ctx.fillRect(Math.round(sx+w-4-w*0.35+ox - swing), Math.round(sy+h-6+oy), w*0.35, 4);
    }
    // 无敌罩与受击闪烁
    if(ent.invincibleTime&&ent.invincibleTime>0){ const a=0.25+0.15*Math.sin((ent.animTime||0)*12); ctx.save(); ctx.globalAlpha=Math.max(0.1,Math.min(0.6,a)); ctx.fillStyle='rgba(252,211,77,1)'; ctx.fillRect(sx-3,sy-3,w+6,h+6); ctx.restore(); }
    if(pose==='hurt'){ const a=0.25+0.15*Math.sin((ent.animTime||0)*16); ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(239,68,68,1)'; ctx.fillRect(sx-2,sy-2,w+4,h+4); ctx.restore(); }
  }
}
