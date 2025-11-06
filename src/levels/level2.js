import { TILE_SIZE } from '../constants.js';

export function createLevel2(){ const rows=18, cols=140; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; grid[rows-2][x]='#'; }
  const box=(x,y,w,h,ch='B')=>{ for(let j=0;j<h;j++) for(let i=0;i<w;i++) grid[y+j][x+i]=ch; };
  box(8,rows-5,4,1); box(16,rows-7,5,1); box(26,rows-9,7,1); box(40,rows-6,8,1); box(55,rows-8,6,1); box(70,rows-10,8,1); box(86,rows-6,10,1); box(102,rows-8,6,1); box(116,rows-10,8,1);
  grid[rows-3][cols-8]='F'; grid[rows-8][18]='Q'; grid[rows-10][56]='Q'; grid[rows-12][90]='Q'; grid[rows-10][118]='Q';
  const spawns=[]; const enemiesAt=[14,18,22,30,34,48,52,60,66,74,90,104,110,124,130]; for(const x of enemiesAt) spawns.push({type:'enemy',x:x*TILE_SIZE,y:(rows-3)*TILE_SIZE});
  const koopaAt=[44,76,112]; for(const x of koopaAt) spawns.push({type:'koopa',x:x*TILE_SIZE,y:(rows-3)*TILE_SIZE});
  const coinsAt=[9,17,27,41,56,71,87,103,117,126,135]; for(const x of coinsAt) spawns.push({type:'coin',x:x*TILE_SIZE,y:(rows-12)*TILE_SIZE});
  const mushAt=[20,45,72,95,120]; for(const x of mushAt) spawns.push({type:'mushroom',x:x*TILE_SIZE,y:(rows-6)*TILE_SIZE});
  const spawn={x:3*TILE_SIZE,y:(rows-4)*TILE_SIZE}; grid[rows-4][3]='P';
  return { rows,cols,get(x,y){return grid[y][x];}, set(x,y,ch){grid[y][x]=ch;}, grid, spawn, spawns, timeLimit:300 };
}

