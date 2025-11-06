// 轻量关卡编辑器（叠加在游戏画面上）
import { TILE_SIZE } from '../constants.js';

export class LevelEditor {
  constructor(game, canvas, renderer) {
    this.game = game; this.canvas = canvas; this.renderer = renderer;
    this.active = false; this.mode = 'tile'; // 'tile' | 'spawn'
    this.tileType = '#';
    this.spawnType = 'enemy';
    this._ui = null; this._onMouse = this.onMouse.bind(this);
    this._onContext = (e)=>{ if(this.active){ e.preventDefault(); this.handleClick(e, true);} };
  }
  toggle(){ this.active = !this.active; if(this.active) this.mountUI(); else this.unmountUI(); }
  mountUI(){
    if (this._ui) return;
    const wrap = document.createElement('div'); wrap.id='editor-panel'; wrap.className='editor-panel';
    wrap.innerHTML = `
      <div class="editor-toolbar">
        <span class="title">关卡编辑器</span>
        <label>模式
          <select id="ed-mode">
            <option value="tile">地块</option>
            <option value="spawn">刷怪</option>
          </select>
        </label>
        <label>类型
          <select id="ed-type"></select>
        </label>
        <button id="ed-export">导出JSON</button>
        <button id="ed-close">退出编辑(E)</button>
      </div>
      <div class="hint">左键放置，右键删除。数字键 1/2/3 快速切换常用类型（#、B、Q 或 enemy、koopa、coin）。</div>
    `;
    document.body.appendChild(wrap); this._ui = wrap;
    const modeSel = wrap.querySelector('#ed-mode'); const typeSel = wrap.querySelector('#ed-type');
    const refillType = ()=>{
      typeSel.innerHTML='';
      const list = this.mode==='tile' ? ['#','B','Q','V','X','F','A','K'] : ['enemy','koopa','coin','mushroom','flower','piranha','cheep','blooper','cannon','hammer-bro','lakitu','spiny','star','firebar'];
      for(const t of list){ const opt=document.createElement('option'); opt.value=t; opt.textContent=t; typeSel.appendChild(opt);} typeSel.value = this.mode==='tile'?this.tileType:this.spawnType;
    };
    modeSel.addEventListener('change',()=>{ this.mode = modeSel.value; refillType(); });
    typeSel.addEventListener('change',()=>{ if(this.mode==='tile') this.tileType=typeSel.value; else this.spawnType=typeSel.value; });
    wrap.querySelector('#ed-export').addEventListener('click',()=>this.exportJSON());
    wrap.querySelector('#ed-close').addEventListener('click',()=>this.toggle());
    refillType();
    // 事件
    this.canvas.addEventListener('mousedown', this._onMouse);
    this.canvas.addEventListener('contextmenu', this._onContext);
  }
  unmountUI(){ if(!this._ui) return; this.canvas.removeEventListener('mousedown', this._onMouse); this.canvas.removeEventListener('contextmenu', this._onContext); this._ui.remove(); this._ui=null; }
  onMouse(e){ if(!this.active) return; this.handleClick(e, e.button===2); }
  handleClick(e, isRight){ const rect=this.canvas.getBoundingClientRect(); const gx = Math.floor((e.clientX-rect.left + this.renderer.camera.x)/TILE_SIZE); const gy = Math.floor((e.clientY-rect.top + this.renderer.camera.y)/TILE_SIZE); const level=this.game.level; if(!level||gx<0||gy<0||gx>=level.cols||gy>=level.rows) return; if(this.mode==='tile'){ if(isRight) level.set(gx,gy,'-'); else level.set(gx,gy,this.tileType);} else { if(isRight){ // 删除靠近的spawn
        if (Array.isArray(level.spawns)) { const cx=gx*TILE_SIZE, cy=gy*TILE_SIZE; for(let i=level.spawns.length-1;i>=0;i--){ const s=level.spawns[i]; if(Math.abs(s.x-cx)<TILE_SIZE/2 && Math.abs(s.y-cy)<TILE_SIZE/2) level.spawns.splice(i,1);} }
      } else {
        if(!Array.isArray(level.spawns)) level.spawns=[]; const x=gx*TILE_SIZE, y=gy*TILE_SIZE; const s={ type:this.spawnType, x, y };
        if(this.spawnType==='firebar'){ s.segments=6; s.speed=2.0; }
        if(this.spawnType==='cannon'){ s.dir=-1; s.period=2.2; }
        level.spawns.push(s);
      } }
  }
  drawOverlay(ctx){ if(!this.active) return; const cam=this.renderer.camera; const w=this.canvas.width, h=this.canvas.height; ctx.save(); ctx.strokeStyle='#ffffff22'; ctx.lineWidth=1; // 网格
    const startX = Math.floor(cam.x / TILE_SIZE) * TILE_SIZE - cam.x; const startY = Math.floor(cam.y / TILE_SIZE) * TILE_SIZE - cam.y;
    for(let x=startX; x<w; x+=TILE_SIZE){ ctx.beginPath(); ctx.moveTo(Math.round(x),0); ctx.lineTo(Math.round(x),h); ctx.stroke(); }
    for(let y=startY; y<h; y+=TILE_SIZE){ ctx.beginPath(); ctx.moveTo(0,Math.round(y)); ctx.lineTo(w,Math.round(y)); ctx.stroke(); }
    ctx.restore();
  }
  exportJSON(){ const level=this.game.level; if(!level) return; const data={ rows:level.rows, cols:level.cols, grid: level.grid, spawn: level.spawn, spawns: level.spawns || [], theme: level.theme||'sky', timeLimit: level.timeLimit||300 }; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='level-export.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); }
}

