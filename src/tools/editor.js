// 轻量关卡编辑器（叠加在游戏画面上）
import { TILE_SIZE } from '../constants.js';

  export class LevelEditor {
  constructor(game, canvas, renderer) {
    this.game = game; this.canvas = canvas; this.renderer = renderer;
    this.active = false; this.mode = 'tile'; // 'tile' | 'spawn'
    this.tileType = '#';
    this.spawnType = 'enemy';
    this._ui = null; this._onMouse = this.onMouse.bind(this);
    this._onKey = this.onKey.bind(this);
    this._onContext = (e)=>{ if(this.active){ e.preventDefault(); this.handleClick(e, true);} };
    this._selected = null; // 选中的刷怪
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
        <span id="ed-params"></span>
        <button id="ed-export">导出JSON</button>
        <button id="ed-import">导入JSON</button>
        <button id="ed-close">退出编辑(E)</button>
      </div>
      <div class="hint">左键放置，右键删除。数字键 1/2/3 快速切换常用类型（#、B、Q 或 enemy、koopa、coin）。</div>
      <div class="hint" id="ed-level-settings"></div>
    `;
    document.body.appendChild(wrap); this._ui = wrap;
    const modeSel = wrap.querySelector('#ed-mode'); const typeSel = wrap.querySelector('#ed-type');
    const paramsHost = wrap.querySelector('#ed-params');
    const levelHost = wrap.querySelector('#ed-level-settings');
    const refillType = ()=>{
      typeSel.innerHTML='';
      const list = this.mode==='tile' ? ['#','B','Q','V','X','F','A','K'] : ['enemy','koopa','coin','mushroom','flower','piranha','cheep','blooper','cannon','hammer-bro','lakitu','spiny','star','firebar'];
      for(const t of list){ const opt=document.createElement('option'); opt.value=t; opt.textContent=t; typeSel.appendChild(opt);} typeSel.value = this.mode==='tile'?this.tileType:this.spawnType;
      this.renderParams(paramsHost);
      this.renderLevelSettings(levelHost);
    };
    modeSel.addEventListener('change',()=>{ this.mode = modeSel.value; refillType(); });
    typeSel.addEventListener('change',()=>{ if(this.mode==='tile') this.tileType=typeSel.value; else this.spawnType=typeSel.value; });
    wrap.querySelector('#ed-export').addEventListener('click',()=>this.exportJSON());
    const importBtn = wrap.querySelector('#ed-import');
    const file = document.createElement('input'); file.type='file'; file.accept='application/json'; file.style.display='none';
    importBtn.after(file); importBtn.addEventListener('click',()=>file.click());
    file.addEventListener('change', async ()=>{ const f=file.files?.[0]; if(!f) return; const text = await f.text(); try { const data=JSON.parse(text); this.applyJSON(data); } catch(err){ console.warn('导入失败', err); } file.value=''; });
    wrap.querySelector('#ed-close').addEventListener('click',()=>this.toggle());
    refillType();
    // 事件
    this.canvas.addEventListener('mousedown', this._onMouse);
    this.canvas.addEventListener('contextmenu', this._onContext);
    window.addEventListener('keydown', this._onKey);
  }
  unmountUI(){ if(!this._ui) return; this.canvas.removeEventListener('mousedown', this._onMouse); this.canvas.removeEventListener('contextmenu', this._onContext); window.removeEventListener('keydown', this._onKey); this._ui.remove(); this._ui=null; this._selected=null; }
  onMouse(e){ if(!this.active) return; this.handleClick(e, e.button===2); }
  handleClick(e, isRight){ const rect=this.canvas.getBoundingClientRect(); const gx = Math.floor((e.clientX-rect.left + this.renderer.camera.x)/TILE_SIZE); const gy = Math.floor((e.clientY-rect.top + this.renderer.camera.y)/TILE_SIZE); const level=this.game.level; if(!level||gx<0||gy<0||gx>=level.cols||gy>=level.rows) return; if(this.mode==='tile'){ if(isRight) level.set(gx,gy,'-'); else level.set(gx,gy,this.tileType);} else { const cx=gx*TILE_SIZE, cy=gy*TILE_SIZE; if(isRight){ // 删除靠近的spawn
        if (Array.isArray(level.spawns)) { for(let i=level.spawns.length-1;i>=0;i--){ const s=level.spawns[i]; if(Math.abs(s.x-cx)<TILE_SIZE/2 && Math.abs(s.y-cy)<TILE_SIZE/2) level.spawns.splice(i,1);} this._selected=null; this.renderParams(this._ui.querySelector('#ed-params')); }
      } else {
        // 先尝试选择已有spawn
        let found=null; if (Array.isArray(level.spawns)) for(const s of level.spawns){ if(Math.abs(s.x-cx)<TILE_SIZE/2 && Math.abs(s.y-cy)<TILE_SIZE/2){ found=s; break; } }
        if (found) { this._selected=found; this.renderParams(this._ui.querySelector('#ed-params')); }
        else { if(!Array.isArray(level.spawns)) level.spawns=[]; const s={ type:this.spawnType, x:cx, y:cy };
          if(this.spawnType==='firebar'){ s.segments=6; s.speed=2.0; }
          if(this.spawnType==='cannon'){ s.dir=-1; s.period=2.2; }
          level.spawns.push(s); this._selected=s; this.renderParams(this._ui.querySelector('#ed-params')); }
      } }
  }
  drawOverlay(ctx){ if(!this.active) return; const cam=this.renderer.camera; const w=this.canvas.width, h=this.canvas.height; ctx.save(); ctx.strokeStyle='#ffffff22'; ctx.lineWidth=1; // 网格
    const startX = Math.floor(cam.x / TILE_SIZE) * TILE_SIZE - cam.x; const startY = Math.floor(cam.y / TILE_SIZE) * TILE_SIZE - cam.y;
    for(let x=startX; x<w; x+=TILE_SIZE){ ctx.beginPath(); ctx.moveTo(Math.round(x),0); ctx.lineTo(Math.round(x),h); ctx.stroke(); }
    for(let y=startY; y<h; y+=TILE_SIZE){ ctx.beginPath(); ctx.moveTo(0,Math.round(y)); ctx.lineTo(w,Math.round(y)); ctx.stroke(); }
    // 高亮选中
    if (this._selected) { const sx = Math.round(this._selected.x - cam.x), sy = Math.round(this._selected.y - cam.y); ctx.strokeStyle='#22c55e'; ctx.lineWidth=2; ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE); }
    ctx.restore();
  }
  exportJSON(){ const level=this.game.level; if(!level) return; const data={ rows:level.rows, cols:level.cols, grid: level.grid, spawn: level.spawn, spawns: level.spawns || [], theme: level.theme||'sky', timeLimit: level.timeLimit||300 }; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='level-export.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000); }
  applyJSON(data){ const level=this.game.level; if(!level||!data) return; if(Array.isArray(data.grid)&&Number.isInteger(data.rows)&&Number.isInteger(data.cols)){ level.rows=data.rows; level.cols=data.cols; level.grid=data.grid; }
    if (data.theme) level.theme=data.theme; if (Number.isInteger(data.timeLimit)) level.timeLimit=data.timeLimit;
    if (Array.isArray(data.spawns)) level.spawns=data.spawns;
    if (data.spawn && Number.isFinite(data.spawn.x) && Number.isFinite(data.spawn.y)) level.spawn=data.spawn;
    // 立刻更新世界尺寸
    this.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE);
  }
  renderParams(host){ if(!host) return; const s=this._selected; if(!s){ host.innerHTML=''; return; }
    let html=''; if (s.type==='cannon'){
      html = `方向:<select id="p-dir"><option value="-1">左</option><option value="1">右</option></select> 周期:<input id="p-period" type="number" step="0.1" style="width:60px" /> 视距:<input id="p-range" type="number" step="10" style="width:60px" /> 上限:<input id="p-max" type="number" step="1" style="width:60px" /> <button id="p-apply">应用</button> <button id="p-del">删除</button>`;
    } else if (s.type==='firebar'){
      html = `节数:<input id="p-seg" type="number" step="1" style="width:60px" /> 速度:<input id="p-speed" type="number" step="0.1" style="width:60px" /> <button id="p-apply">应用</button> <button id="p-del">删除</button>`;
    } else if (s.type==='lakitu'){
      html = `投掷间隔:<input id="p-drop" type="number" step="0.1" style="width:60px" /> <button id="p-apply">应用</button> <button id="p-del">删除</button>`;
    } else if (s.type==='cheep'){
      html = `方向:<select id="p-dir"><option value="-1">左</option><option value="1">右</option></select> <button id="p-apply">应用</button> <button id="p-del">删除</button>`;
    } else if (s.type==='hammer-bro'){
      html = `跳跃CD:<input id="p-jcd" type="number" step="0.1" style="width:60px" /> 投掷CD:<input id="p-tcd" type="number" step="0.1" style="width:60px" /> <button id="p-apply">应用</button> <button id="p-del">删除</button>`;
    } else { html = `<em>类型: ${s.type}</em> <button id="p-del">删除</button>`; }
    host.innerHTML = html;
    const byId=(id)=>host.querySelector(id);
    if (s.type==='cannon'){ const dir=byId('#p-dir'); const period=byId('#p-period'); const rng=byId('#p-range'); const mx=byId('#p-max'); dir.value=String(s.dir ?? -1); period.value=String(s.period ?? 2.2); if(rng) rng.value=String(s.range ?? 320); if(mx) mx.value=String(s.maxActive ?? 2); byId('#p-apply').onclick=()=>{ s.dir=parseInt(dir.value)||-1; s.period=parseFloat(period.value)||2.2; if(rng) s.range=Math.max(0, parseFloat(rng.value)||320); if(mx) s.maxActive=Math.max(0, parseInt(mx.value)||2); } }
    if (s.type==='firebar'){ const seg=byId('#p-seg'); const sp=byId('#p-speed'); seg.value=String(s.segments ?? 6); sp.value=String(s.speed ?? 2.0); byId('#p-apply').onclick=()=>{ s.segments=Math.max(1, parseInt(seg.value)||6); s.speed=parseFloat(sp.value)||2.0; } }
    if (s.type==='lakitu'){ const d=byId('#p-drop'); d.value=String(s.dropCd ?? 1.8); byId('#p-apply').onclick=()=>{ s.dropCd=Math.max(0.1, parseFloat(d.value)||1.8); } }
    if (s.type==='cheep'){ const dir=byId('#p-dir'); dir.value=String(s.dir ?? -1); byId('#p-apply').onclick=()=>{ s.dir=parseInt(dir.value)||-1; } }
    if (s.type==='hammer-bro'){ const j=byId('#p-jcd'); const t=byId('#p-tcd'); j.value=String(s.jumpCd ?? 1.8); t.value=String(s.throwCd ?? 1.2); byId('#p-apply').onclick=()=>{ s.jumpCd=Math.max(0.2, parseFloat(j.value)||1.8); s.throwCd=Math.max(0.2, parseFloat(t.value)||1.2); } }
    const del=byId('#p-del'); if (del) del.onclick=()=>{ const arr=this.game.level.spawns; const i=arr.indexOf(s); if(i>=0) arr.splice(i,1); this._selected=null; this.renderParams(host); };
  }
  renderLevelSettings(host){ if(!host) return; const level=this.game.level; if(!level){ host.innerHTML=''; return; }
    const theme=level.theme||'sky'; const tl=level.timeLimit||300; const ltt=level.lowTimeThreshold??''; const als=level.alertLastSeconds??''; const tps=level.timeBonusPerSecond??''; const fb=(level.flagBonus||[100,400,800,2000,5000]).join(',');
    host.innerHTML = `主题:<select id="lv-theme"><option value="sky">sky</option><option value="underground">underground</option><option value="castle">castle</option><option value="water">water</option></select> 时间限制:<input id="lv-tl" type="number" step="1" style="width:70px" /> 低时限:<input id="lv-ltt" type="number" step="1" style="width:70px" /> 警报秒:<input id="lv-als" type="number" step="1" style="width:70px" /> 换分倍率:<input id="lv-tps" type="number" step="1" style="width:70px" /> 旗奖励:<input id="lv-fb" type="text" style="width:160px" placeholder="100,400,800,2000,5000" /> <button id="lv-apply">应用关卡设置</button>`;
    const byId=(id)=>host.querySelector(id);
    byId('#lv-theme').value=theme; byId('#lv-tl').value=String(tl); if(ltt!=='') byId('#lv-ltt').value=String(ltt); if(als!=='') byId('#lv-als').value=String(als); if(tps!=='') byId('#lv-tps').value=String(tps); byId('#lv-fb').value=fb;
    byId('#lv-apply').onclick=()=>{ level.theme=byId('#lv-theme').value; const ntl=parseInt(byId('#lv-tl').value)||tl; level.timeLimit=ntl; const nltt=parseInt(byId('#lv-ltt').value); level.lowTimeThreshold=Number.isFinite(nltt)?nltt:undefined; const nals=parseInt(byId('#lv-als').value); level.alertLastSeconds=Number.isFinite(nals)?nals:undefined; const ntps=parseInt(byId('#lv-tps').value); level.timeBonusPerSecond=Number.isFinite(ntps)?ntps:undefined; const tiers=byId('#lv-fb').value.split(',').map(s=>parseInt(s.trim())).filter(n=>Number.isFinite(n)); if(tiers.length>=5) level.flagBonus=tiers.slice(0,5); this.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE); };
  }
  onKey(e){ if(!this.active) return; if(e.code==='Digit1'){ if(this.mode==='tile') this.tileType='#'; else this.spawnType='enemy'; this._ui.querySelector('#ed-type').value=this.mode==='tile'?this.tileType:this.spawnType; }
    else if(e.code==='Digit2'){ if(this.mode==='tile') this.tileType='B'; else this.spawnType='koopa'; this._ui.querySelector('#ed-type').value=this.mode==='tile'?this.tileType:this.spawnType; }
    else if(e.code==='Digit3'){ if(this.mode==='tile') this.tileType='Q'; else this.spawnType='coin'; this._ui.querySelector('#ed-type').value=this.mode==='tile'?this.tileType:this.spawnType; }
  }
}
