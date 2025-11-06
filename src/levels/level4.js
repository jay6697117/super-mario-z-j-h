import { TILE_SIZE } from '../constants.js';

export function createLevel4(){
  const rows=18, cols=120; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  // 城堡地面与平台（紧凑）
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; grid[rows-2][x]='#'; }
  const box=(x,y,w,h,ch='B')=>{ for(let j=0;j<h;j++) for(let i=0;i<w;i++) grid[y+j][x+i]=ch; };
  // 高台与跳台
  box(12,rows-5,6,1,'B'); box(24,rows-7,6,1,'B'); box(36,rows-6,5,1,'B'); box(52,rows-8,6,1,'B');
  // 终点：桥 + 斧头（A）。桥为行 rows-3 的一段 B，斧头位于桥尾
  const bridgeRow = rows-3; const axeCol = cols-6; for(let c=axeCol-10;c<axeCol;c++){ grid[bridgeRow][c] = 'B'; }
  grid[bridgeRow][axeCol] = 'A';
  // 管道与出口（可选）
  // 敌人和火条
  const spawns=[];
  // 两个火条（支点坐标为像素）
  spawns.push({ type:'firebar', x: 40*TILE_SIZE + TILE_SIZE/2, y: (rows-6)*TILE_SIZE + TILE_SIZE/2, segments: 6, speed: 2.2 });
  spawns.push({ type:'firebar', x: 70*TILE_SIZE + TILE_SIZE/2, y: (rows-8)*TILE_SIZE + TILE_SIZE/2, segments: 8, speed: -1.8 });
  // 若干敌人
  const enemiesAt=[18,28,46,64,92]; for(const x of enemiesAt) spawns.push({ type:'enemy', x:x*TILE_SIZE, y:(rows-3)*TILE_SIZE });
  const koopaAt=[58,84]; for(const x of koopaAt) spawns.push({ type:'koopa', x:x*TILE_SIZE, y:(rows-3)*TILE_SIZE });
  // 锤兄
  spawns.push({ type:'hammer-bro', x: 44*TILE_SIZE, y:(rows-6)*TILE_SIZE });
  const coinsAt=[14,26,38,50,62,74,86,98,110]; for(const x of coinsAt) spawns.push({ type:'coin', x:x*TILE_SIZE, y:(rows-10)*TILE_SIZE });
  const mushAt=[22,44,76]; for(const x of mushAt) spawns.push({ type:'mushroom', x:x*TILE_SIZE, y:(rows-6)*TILE_SIZE });

  const spawn={ x: 3*TILE_SIZE, y: (rows-4)*TILE_SIZE };
  const level={ rows, cols, grid, spawn, spawns, theme:'castle', timeLimit: 300,
    get(x,y){ return grid[y][x]; }, set(x,y,ch){ grid[y][x]=ch; }
  };
  return level;
}
