import { TILE_SIZE } from '../constants.js';

export function createLevel1(){
  const rows=17, cols=120; const grid=Array.from({length:rows},()=>Array(cols).fill('-'));
  for(let x=0;x<cols;x++){ grid[rows-1][x]='#'; grid[rows-2][x]='#'; }
  const box=(x,y,w,h,ch='#')=>{ for(let j=0;j<h;j++) for(let i=0;i<w;i++) grid[y+j][x+i]=ch; };
  box(12,rows-3,6,1,'B'); box(25,rows-5,4,1,'B'); box(35,rows-7,6,1,'B'); box(48,rows-5,5,1,'B'); box(62,rows-7,6,1,'B'); box(78,rows-5,6,1,'B'); box(95,rows-6,4,1,'B');
  grid[rows-6][26]='Q'; grid[rows-8][36]='Q'; grid[rows-6][64]='Q';
  grid[rows-3][cols-6]='F';
  const pipeCol=18; grid[rows-3][pipeCol]='V';
  const spawns=[]; const enemiesAt=[20,28,40,55,70,88,100]; for(const x of enemiesAt) spawns.push({type:'enemy',x:x*TILE_SIZE,y:(rows-3)*TILE_SIZE});
  const coinsAt=[14,16,26,27,36,38,49,63,64,79,96]; for(const x of coinsAt) spawns.push({type:'coin',x:x*TILE_SIZE,y:(rows-6)*TILE_SIZE});
  const mushAt=[22,50,85]; for(const x of mushAt) spawns.push({type:'mushroom',x:x*TILE_SIZE,y:(rows-6)*TILE_SIZE});
  const spawn={x:3*TILE_SIZE,y:(rows-4)*TILE_SIZE}; grid[rows-4][3]='P';

  // 地下
  const subRows=18, subCols=60; const sub=Array.from({length:subRows},()=>Array(subCols).fill('-'));
  for(let x=0;x<subCols;x++){ sub[subRows-1][x]='#'; sub[subRows-2][x]='#'; }
  const sbox=(x,y,w,h,ch='B')=>{ for(let j=0;j<h;j++) for(let i=0;i<w;i++) sub[y+j][x+i]=ch; };
  sbox(8,subRows-6,6,1); sbox(22,subRows-8,6,1); sub[subRows-9][24]='Q'; sub[subRows-3][subCols-6]='X';
  const subSpawn={x:4*TILE_SIZE,y:(subRows-4)*TILE_SIZE}; const returnPoint={x:(pipeCol+1)*TILE_SIZE,y:(rows-4)*TILE_SIZE};
  const subSpawns=[{type:'coin',x:9*TILE_SIZE,y:(subRows-10)*TILE_SIZE},{type:'coin',x:23*TILE_SIZE,y:(subRows-12)*TILE_SIZE},{type:'star',x:24*TILE_SIZE,y:(subRows-10)*TILE_SIZE}];
  // 管道上的食人花
  spawns.push({ type:'piranha', x: pipeCol*TILE_SIZE + TILE_SIZE/2, y: (rows-3)*TILE_SIZE });

  const level={ activeRoom:'main', timeLimit:300, main:{grid,rows,cols,spawn,spawns}, sub:{grid:sub,rows:subRows,cols:subCols,spawn:subSpawn,spawns:subSpawns}, rows,cols,grid,spawn,spawns, returnPoint,
    get(x,y){ return this.grid[y][x]; }, set(x,y,ch){ this.grid[y][x]=ch; }, getSpawns(){ return this.activeRoom==='main'?this.spawns:this.subSpawns; },
    activate(room){ this.activeRoom=room; if(room==='main'){ this.rows=this.main.rows; this.cols=this.main.cols; this.grid=this.main.grid; this.spawn=this.main.spawn; this.spawns=this.main.spawns; this.subSpawns=this.sub.spawns; } else { this.rows=this.sub.rows; this.cols=this.sub.cols; this.grid=this.sub.grid; this.spawn=this.sub.spawn; this.subSpawns=this.sub.spawns; this.spawns=[]; } }
  };
  level.activate('main');
  return level;
}
