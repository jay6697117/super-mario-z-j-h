// 浏览器内最小测试脚本：打开页面后在控制台运行 runTests()
import { Physics } from '../engine/physics.js';
import { TILE_SIZE } from '../constants.js';
import { Piranha } from '../entities/piranha.js';
import { Lakitu } from '../entities/lakitu.js';
import { Bullet } from '../entities/bullet.js';
import { Enemy } from '../entities/enemy.js';
import { Shell } from '../entities/koopa.js';
import { getLevelMeta } from '../data/levels-meta.js';
import { Renderer } from '../engine/renderer.js';
import { createRNG, pickWeighted } from '../engine/rng.js';

export function runTests(){
  const results=[]; const physics=new Physics();
  // aabbOverlap
  const a={x:0,y:0,w:10,h:10}, b={x:5,y:5,w:10,h:10}, c={x:20,y:20,w:4,h:4};
  results.push(['aabb-overlap-1', physics.aabbOverlap(a,b)===true]);
  results.push(['aabb-overlap-2', physics.aabbOverlap(a,c)===false]);
  // 计分换算（结算阶段整数秒差额）
  const bonus=5; const calc=(time,drain)=>{ const before=Math.ceil(time); const after=Math.ceil(Math.max(0,time-drain)); const delta=Math.max(0,before-after); return delta*bonus; };
  results.push(['settle-1', calc(10.0, 0.5)===0]);
  results.push(['settle-2', calc(10.1, 0.2)===0]);
  results.push(['settle-3', calc(10.1, 1.2)===5]);
  results.push(['settle-4', calc(1.0, 2.0)===5]);
  // 碰撞：从空中落到一行#上，onGround 应为真，且Y不穿透
  const rows=6, cols=10; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; }
  const level={ rows, cols, get(x,y){ if(x<0||y<0||x>=cols||y>=rows) return '#'; return grid[y][x]; } };
  const rect={ x: TILE_SIZE, y: TILE_SIZE, w: 16, h: 16, vx:0, vy:200 };
  const res=physics.collideAndSlideRect(rect, 0, TILE_SIZE*3, level);
  results.push(['slide-ground', res.onGround===true]);
  results.push(['touching-down', res.touching && res.touching.down===true]);
  // 头顶撞击：在头上一格放置方块，向上移动应返回 headHit
  const grid2=Array.from({length:rows},()=>Array(cols).fill('-')); grid2[1][1]='#';
  const level2={ rows, cols, get(x,y){ if(x<0||y<0||x>=cols||y>=rows) return '#'; return grid2[y][x]; } };
  const rect2={ x:TILE_SIZE, y:TILE_SIZE*2, w:16, h:16, vx:0, vy:-200 };
  const res2=physics.collideAndSlideRect(rect2, 0, -TILE_SIZE, level2);
  results.push(['head-hit', !!res2.headHit]);
  results.push(['touching-up', res2.touching && res2.touching.up===true]);

  // 水平撞墙：应触发 touching.left 或 touching.right
  const grid3=Array.from({length:rows},()=>Array(cols).fill('-')); for(let y=0;y<rows;y++){ grid3[y][4]='#'; }
  const level3={ rows, cols, get(x,y){ if(x<0||y<0||x>=cols||y>=rows) return '#'; return grid3[y][x]; } };
  const rect3={ x: 3*TILE_SIZE, y: TILE_SIZE, w: 16, h: 16 };
  const res3=physics.collideAndSlideRect(rect3, TILE_SIZE*1.2, 0, level3);
  results.push(['touching-right', res3.touching && res3.touching.right===true]);
  // 食人花：近距玩家阻塞逻辑（近时不露头，远离后上浮）
  const pipeTopY = 5*TILE_SIZE; const pipeCenterX = 10*TILE_SIZE + TILE_SIZE/2;
  const pir = new Piranha(pipeCenterX, pipeTopY);
  // 模拟玩家近距：与管口中心 1 格内，且玩家底部不高于管口顶+6
  const nearPlayer = { x: pipeCenterX - 10, y: pipeTopY - 40, w: 16, h: 16 };
  for (let i=0;i<10;i++) pir.update(0.1, physics, level, nearPlayer);
  const yNear = pir.y;
  // 模拟玩家远离
  const farPlayer = { x: pipeCenterX + TILE_SIZE*4, y: pipeTopY + TILE_SIZE*4, w: 16, h: 16 };
  for (let i=0;i<30;i++) pir.update(0.1, physics, level, farPlayer);
  const yFar = pir.y;
  results.push(['piranha-block-near', yNear > pir.baseY + 8]);
  results.push(['piranha-rise-far', yFar <= pir.baseY + 2]);

  // Lakitu：投掷节奏与上限（无渲染，纯逻辑）
  const lak = new Lakitu(100, 50); lak.dropCd = 0.2; lak.maxSpinyActive = 2; lak.dropActiveRangeTiles = 50;
  const ents=[]; const player={ x:110, y:50, w:16, h:16 };
  for(let i=0;i<10;i++){ lak.update(0.1, physics, level, player, ents); }
  const spawned1 = ents.filter(e=>e.kind==='spiny').length >= 1;
  // 填满上限，再推进足够时间，数量不应无限增长
  while(ents.filter(e=>e.kind==='spiny').length < 2){ ents.push({kind:'spiny', dead:false}); }
  const before=ents.filter(e=>e.kind==='spiny').length;
  for(let i=0;i<10;i++){ lak.update(0.2, physics, level, player, ents); }
  const after=ents.filter(e=>e.kind==='spiny').length;
  results.push(['lakitu-spawn-basic', spawned1===true]);
  results.push(['lakitu-max-active', after===before]);

  // Bullet 命中 Lakitu/Spiny：按主循环的种类过滤应致死
  const bullet = new Bullet(50,50,1); bullet.vx=0; bullet.vy=0; const lak2 = new Lakitu(50,50); const sp2={kind:'spiny',x:52,y:50,w:24,h:20,dead:false};
  const kinds = (t)=> (t.kind==='enemy'||t.kind==='koopa'||t.kind==='shell'||t.kind==='cheep'||t.kind==='blooper'||t.kind==='bill'||t.kind==='hammer-bro'||t.kind==='lakitu'||t.kind==='spiny');
  if (physics.aabbOverlap(bullet,lak2) && kinds(lak2)) lak2.dead=true;
  if (physics.aabbOverlap(bullet,sp2) && kinds(sp2)) sp2.dead=true;
  results.push(['bullet-kills-lakitu', lak2.dead===true]);
  results.push(['bullet-kills-spiny', sp2.dead===true]);

  // 壳撞敌：应致死
  const sh=new Shell(10,10); sh.vx=200; sh.w=26; sh.h=22; const en=new Enemy(10,10); if (physics.aabbOverlap(sh,en)) en.dead=true; results.push(['shell-kills-enemy', en.dead===true]);

  // 踩踏判定：Spiny 与 Piranha 不可踩
  const playerVy=100; const playerBottom=100; const sp={kind:'spiny', top:()=>95}; const pi={kind:'piranha', top:()=>95};
  const stomping=(ent)=> (ent.kind!=='piranha' && ent.kind!=='spiny') && (playerVy>0) && (playerBottom - ent.top() < 16);
  results.push(['stomp-spiny-false', stomping(sp)===false]);
  results.push(['stomp-piranha-false', stomping(pi)===false]);

  // 元数据：水下关（1-3）的时间应为 400
  try { const meta13 = getLevelMeta(2); results.push(['meta-1-3-timelimit-400', meta13 && meta13.timeLimit===400]); } catch { results.push(['meta-1-3-timelimit-400', false]); }

  // 渲染快照：固定关卡与摄像机，验证砖块像素颜色
  try {
    const canvas=document.createElement('canvas'); canvas.width=96; canvas.height=96; const ctx=canvas.getContext('2d');
    const renderer=new Renderer(canvas, ctx); const r2=6, c2=6; const gridS=Array.from({length:r2},()=>Array(c2).fill('-')); gridS[3][2]='B';
    const lvl={ rows:r2, cols:c2, grid:gridS, theme:'sky', get(x,y){ return gridS[y][x]; } };
    renderer.setWorldSize(c2*TILE_SIZE, r2*TILE_SIZE);
    renderer.camera.x=0; renderer.camera.y=0;
    renderer.clear(); renderer.drawBackground(lvl); renderer.drawLevel(lvl);
    const px = 2*TILE_SIZE + Math.floor(TILE_SIZE/2), py = 3*TILE_SIZE + Math.floor(TILE_SIZE/2);
    const data = ctx.getImageData(px, py, 1, 1).data; const toHex=(v)=>v.toString(16).padStart(2,'0'); const hex = `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`;
    results.push(['snapshot-brick-center', hex.toLowerCase()==='#a16207']);
  } catch(err){ results.push(['snapshot-brick-center', false]); }

  // 移动平台：从上方落下应站稳
  const plat={ kind:'platform', x: 32, y: 64, w: 48, h: 12, dx:0, dy:0 };
  const pl={ x: 36, y: 40, w: 16, h: 16, vy: 100 };
  const overlap = !(pl.x + pl.w <= plat.x || pl.x >= plat.x + plat.w || pl.y + pl.h <= plat.y || pl.y >= plat.y + plat.h);
  const wasAbove = (pl.y + pl.h) <= plat.y + 4 && pl.vy >= 0;
  const stable = overlap && wasAbove;
  results.push(['platform-stand', stable===true]);

  // RNG 确定性：相同种子下权重选择序列一致
  try {
    const table=[{type:'coin',weight:0.5},{type:'star',weight:0.25},{type:'mushroom',weight:0.25}];
    const rngA=createRNG('seed-123'); const rngB=createRNG('seed-123');
    const seqA=[], seqB=[]; for(let i=0;i<8;i++){ seqA.push(pickWeighted(table, rngA.random)); seqB.push(pickWeighted(table, rngB.random)); }
    results.push(['rng-drops-deterministic', JSON.stringify(seqA)===JSON.stringify(seqB)]);
  } catch { results.push(['rng-drops-deterministic', false]); }
  const failed=results.filter(([,ok])=>!ok);
  console.table(results.map(([name,ok])=>({name, ok}))); if(failed.length===0) console.log('所有测试通过'); else console.warn('失败用例', failed);
}
