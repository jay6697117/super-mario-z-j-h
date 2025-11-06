import { TILE_SIZE } from '../constants.js';

// 1-3：改为水下关
export function createLevel3(){ const rows=18, cols=120; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  // 保留底部两行实体地面，其他为空（整体当作水域）
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; grid[rows-2][x]='#'; }
  // 终点旗杆仍可用于结算
  grid[rows-3][cols-6]='F';
  const spawns=[];
  // 水下金币
  const coinsAt=[10,18,28,36,44,58,66,78,88,96,104]; for(const cx of coinsAt) spawns.push({type:'coin',x:cx*TILE_SIZE,y:(rows-10)*TILE_SIZE});
  // 鱼群：左右方向交错
  const fishXs=[20,30,40,55,70,85,95,105]; let flip=-1; for(const fx of fishXs){ spawns.push({type:'cheep', x:fx*TILE_SIZE, y:(rows-8)*TILE_SIZE, dir: flip}); flip*=-1; }
  // 乌贼若干
  const bloopXs=[48,72,98]; for(const bx of bloopXs){ spawns.push({type:'blooper', x:bx*TILE_SIZE, y:(rows-9)*TILE_SIZE}); }
  // 道具
  const mushAt=[26,62,90]; for(const mx of mushAt) spawns.push({type:'mushroom',x:mx*TILE_SIZE,y:(rows-7)*TILE_SIZE});
  const spawn={x:3*TILE_SIZE,y:(rows-8)*TILE_SIZE}; grid[rows-8][3]='P';
  return { rows,cols,get(x,y){return grid[y][x];}, set(x,y,ch){grid[y][x]=ch;}, grid, spawn, spawns, timeLimit:400, theme:'water' };
}
