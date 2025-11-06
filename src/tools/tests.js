// 浏览器内最小测试脚本：打开页面后在控制台运行 runTests()
import { Physics } from '../engine/physics.js';
import { TILE_SIZE } from '../constants.js';

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
  // 头顶撞击：在头上一格放置方块，向上移动应返回 headHit
  const grid2=Array.from({length:rows},()=>Array(cols).fill('-')); grid2[1][1]='#';
  const level2={ rows, cols, get(x,y){ if(x<0||y<0||x>=cols||y>=rows) return '#'; return grid2[y][x]; } };
  const rect2={ x:TILE_SIZE, y:TILE_SIZE*2, w:16, h:16, vx:0, vy:-200 };
  const res2=physics.collideAndSlideRect(rect2, 0, -TILE_SIZE, level2);
  results.push(['head-hit', !!res2.headHit]);
  const failed=results.filter(([,ok])=>!ok);
  console.table(results.map(([name,ok])=>({name, ok}))); if(failed.length===0) console.log('所有测试通过'); else console.warn('失败用例', failed);
}
