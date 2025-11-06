import { TILE_SIZE } from '../constants.js';

export function createLevel3(){ const rows=18, cols=150; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; grid[rows-2][x]='#'; }
  const box=(x,y,w,h,ch='B')=>{ for(let j=0;j<h;j++) for(let i=0;i<w;i++) grid[y+j][x+i]=ch; };
  let x=10; for(let i=0;i<10;i++){ const h=rows-5-(i%2===0?0:2); box(x,h,5,1,'B'); if(i%3===0) grid[h-2][x+2]='Q'; x+=10; }
  grid[rows-3][cols-6]='F';
  const spawns=[]; const enemiesAt=[22,35,48,62,78,96,112,126,138]; for(const ex of enemiesAt) spawns.push({type:'enemy',x:ex*TILE_SIZE,y:(rows-3)*TILE_SIZE});
  const coinsAt=[12,20,30,42,58,74,92,108,122,140]; for(const cx of coinsAt) spawns.push({type:'coin',x:cx*TILE_SIZE,y:(rows-12)*TILE_SIZE});
  const mushAt=[18,50,80,120]; for(const mx of mushAt) spawns.push({type:'mushroom',x:mx*TILE_SIZE,y:(rows-6)*TILE_SIZE});
  const spawn={x:3*TILE_SIZE,y:(rows-4)*TILE_SIZE}; grid[rows-4][3]='P';
  return { rows,cols,get(x,y){return grid[y][x];}, set(x,y,ch){grid[y][x]=ch;}, grid, spawn, spawns, timeLimit:300 };
}

