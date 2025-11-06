// Warp Zone 占位实体（矩形范围触发），逻辑在 main.js 内处理
export class WarpZone {
  constructor(x,y,w,h,toIndex=0){ this.kind='warp'; this.x=x; this.y=y; this.w=w; this.h=h; this.to=toIndex; }
  update(){}
}

