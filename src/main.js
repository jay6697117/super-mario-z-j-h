// 主入口与游戏循环
import { Input } from './engine/input.js';
import { Renderer } from './engine/renderer.js';
import { Physics } from './engine/physics.js';
import { createLevel1 } from './levels/level1.js';
import { createLevel2 } from './levels/level2.js';
import { createLevel3 } from './levels/level3.js';
import { createLevel4 } from './levels/level4.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Coin } from './entities/coin.js';
import { Mushroom } from './entities/mushroom.js';
import { Bullet } from './entities/bullet.js';
import { RewardCoin } from './entities/reward-coin.js';
import { Flower } from './entities/flower.js';
import { Piranha } from './entities/piranha.js';
import { Koopa, Shell } from './entities/koopa.js';
import { Star } from './entities/star.js';
import { sfx } from './engine/sfx.js';
import { Particles } from './engine/particles.js';
import { TILE_SIZE } from './constants.js';
import { GAME_CONFIG } from './config.js';
import { WORLD_MAP as WORLD_MAP_DATA, getLevelMeta, getLevelId } from './data/levels-meta.js';
import { loadProgress, saveProgress, setCurrentLevel as saveCurrentLevel, getCurrentLevel as loadCurrentLevel, setCheckpoint as saveCheckpoint, getCheckpoint as loadCheckpoint, clearCheckpoint } from './data/progress.js';
import { FireBar } from './entities/firebar.js';
import { Cheep } from './entities/cheep.js';
import { Blooper } from './entities/blooper.js';
import { Cannon } from './entities/cannon.js';
import { HammerBro } from './entities/hammer-bro.js';
import { Lakitu } from './entities/lakitu.js';
import { Spiny } from './entities/spiny.js';
import { MovingPlatform } from './entities/platform.js';
import { WarpZone } from './entities/warp.js';
import { FlameSpout } from './entities/flame-spout.js';
import { GameUI } from './engine/ui.js';
import { LevelEditor } from './tools/editor.js';
import { runTests } from './tools/tests.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudScore = document.getElementById('score');
const hudCoins = document.getElementById('coins');
const hudLives = document.getElementById('lives');
const hudLevel = document.getElementById('level');
const banner = document.getElementById('banner');
const hudRoot = document.getElementById('hud');

const GameState = { Playing: 'playing', Paused: 'paused', Win: 'win', Lose: 'lose', Select: 'select' };
// 暴露测试入口
try { window.runTests = runTests; } catch {}
const game = { state: GameState.Playing, level:null, input:new Input(), renderer:new Renderer(canvas, ctx), physics:new Physics(), particles:new Particles(), player:null, entities:[], score:0, coins:0, lives: (GAME_CONFIG.livesEnabled? GAME_CONFIG.initialLives : Infinity), resetRequested:false, currentLevelIndex:0, lastShotAt:0, time:300, timeMax:300, lastTimeSec:null, winStage:null, flagBonus:0, ui:new GameUI(ctx), lowTimeThreshold: GAME_CONFIG.lowTimeThreshold, alertLastSeconds: GAME_CONFIG.alertLastSeconds, timeBonusPerSecond: GAME_CONFIG.timeBonusPerSecond, editor:null };

function getLevelByIndex(i){ const m = ((i%4)+4)%4; if(m===0) return createLevel1(); if(m===1) return createLevel2(); if(m===2) return createLevel3(); if(m===3) return createLevel4(); return createLevel1(); }
const WORLD_MAP = WORLD_MAP_DATA;
// 读取存档的当前关卡
try { const savedIndex = loadCurrentLevel(); if (typeof savedIndex==='number') game.currentLevelIndex = Math.max(0, Math.min(savedIndex, WORLD_MAP.length-1)); } catch {}
function loadLevel(){
  const level=getLevelByIndex(game.currentLevelIndex);
  game.level=level;
  if(typeof level.activate==='function') level.activate('main');
  game.entities.length=0;
  // 玩家初始出生点（支持存档checkpoint覆盖）
  const levelId = (typeof getLevelId === 'function' ? getLevelId(game.currentLevelIndex) : undefined) || (WORLD_MAP[game.currentLevelIndex]||'1-1');
  const cp = (typeof loadCheckpoint === 'function') ? loadCheckpoint(levelId) : undefined;
  const spawnX = (cp && cp.x != null) ? cp.x : level.spawn.x;
  const spawnY = (cp && cp.y != null) ? cp.y : level.spawn.y;
  game.player=new Player(spawnX, spawnY);
  for(const e of (level.getSpawns? level.getSpawns(): level.spawns)){
    if(e.type==='enemy') game.entities.push(new Enemy(e.x,e.y));
    if(e.type==='koopa') game.entities.push(new Koopa(e.x,e.y));
    if(e.type==='coin') game.entities.push(new Coin(e.x,e.y));
    if(e.type==='mushroom') game.entities.push(new Mushroom(e.x,e.y));
    if(e.type==='flower') game.entities.push(new Flower(e.x,e.y));
    if(e.type==='piranha') {
      const opts = { upTime: e.upTime, downTime: e.downTime, holdUp: e.holdUp, holdDown: e.holdDown, nearTilesX: e.nearTilesX, nearYOffset: e.nearYOffset };
      game.entities.push(new Piranha(e.x, e.y, opts));
    }
    if(e.type==='star') game.entities.push(new Star(e.x,e.y));
    if(e.type==='firebar') game.entities.push(new FireBar(e.x, e.y, e.segments, e.speed));
    if(e.type==='cheep') game.entities.push(new Cheep(e.x,e.y,e.dir||-1));
    if(e.type==='blooper') game.entities.push(new Blooper(e.x,e.y));
    if(e.type==='cannon') { const c=new Cannon(e.x,e.y,(e.dir!=null?e.dir:-1),(e.period!=null?e.period:2.2)); if(e.range!=null) c.range=e.range; if(e.maxActive!=null) c.maxActive=e.maxActive; game.entities.push(c);} 
    if(e.type==='hammer-bro') { const h=new HammerBro(e.x,e.y); if(e.jumpCd!=null) h.jumpCd=e.jumpCd; if(e.throwCd!=null) h.throwCd=e.throwCd; game.entities.push(h);} 
    if(e.type==='lakitu') { const l=new Lakitu(e.x,e.y); if(e.dropCd!=null) l.dropCd=e.dropCd; if(e.maxSpinyActive!=null) l.maxSpinyActive=e.maxSpinyActive; if(e.rangeTiles!=null) l.dropActiveRangeTiles=e.rangeTiles; game.entities.push(l);} 
    if(e.type==='spiny') game.entities.push(new Spiny(e.x,e.y));
    if(e.type==='platform-h'){ const p=new MovingPlatform(e.x, e.y, e.w||48, e.h||12, 'h', e.range||96, e.speed||60); game.entities.push(p); }
    if(e.type==='platform-v'){ const p=new MovingPlatform(e.x, e.y, e.w||48, e.h||12, 'v', e.range||96, e.speed||60); game.entities.push(p); }
    if(e.type==='warp'){ const w={ kind:'warp', x:e.x, y:e.y, w:e.w||32, h:e.h||32, to: (typeof e.to==='number'?e.to:0) }; game.entities.push(w); }
    if(e.type==='flame'){ const f=new FlameSpout(e.x, e.y, e.dir||'up', e.length||48, e.period||2.0, e.on||0.8); game.entities.push(f); }
  }
  game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE);
  game.renderer.cameraFollow(game.player);
  game.state=GameState.Playing;
  game.score=0; game.coins=0; game.lives=Infinity; game.resetRequested=false; game.winStage=null;
  hudLevel.textContent = WORLD_MAP[game.currentLevelIndex]||'1-1';
  const __meta = (typeof getLevelMeta === 'function') ? getLevelMeta(game.currentLevelIndex) : undefined;
  const __tl = (level.timeLimit!=null) ? level.timeLimit : ((__meta && __meta.timeLimit)!=null? __meta.timeLimit : 300);
  game.time=game.timeMax=__tl;
  game.lowTimeThreshold = (level.lowTimeThreshold!=null) ? level.lowTimeThreshold : ((__meta && __meta.lowTimeThreshold)!=null ? __meta.lowTimeThreshold : GAME_CONFIG.lowTimeThreshold);
  game.alertLastSeconds = (level.alertLastSeconds!=null) ? level.alertLastSeconds : ((__meta && __meta.alertLastSeconds)!=null ? __meta.alertLastSeconds : GAME_CONFIG.alertLastSeconds);
  game.timeBonusPerSecond = (level.timeBonusPerSecond!=null) ? level.timeBonusPerSecond : ((__meta && __meta.timeBonusPerSecond)!=null ? __meta.timeBonusPerSecond : GAME_CONFIG.timeBonusPerSecond);
  game.lastTimeSec=Math.ceil(game.time);
  updateHUD();
  // 关卡开始提示
  try { const label = WORLD_MAP[game.currentLevelIndex]||''; showBanner(`WORLD ${label}`); setTimeout(hideBanner, 800); } catch {}
  sfx.musicStart();
}
function updateHUD(){
  const addFX=(el)=>{ try{ el.classList.remove('bump'); el.classList.remove('flip'); void el.offsetWidth; el.classList.add('bump'); el.classList.add('flip'); }catch{} };
  // 分数变更时添加HUD轻微动效
  if (hudScore){ const prev=game._hudPrevScore; const v=String(game.score); hudScore.textContent=v; if(prev!==undefined && prev!=v) addFX(hudScore); game._hudPrevScore=v; }
  if (hudCoins){ const prev=game._hudPrevCoins; const v=String(game.coins); hudCoins.textContent=v; if(prev!==undefined && prev!=v) addFX(hudCoins); game._hudPrevCoins=v; }
  if (hudLives){ const prev=game._hudPrevLives; const v=(game.lives===Infinity?'∞':String(Math.max(0, game.lives))); hudLives.textContent=v; if(prev!==undefined && prev!=v) addFX(hudLives); game._hudPrevLives=v; }
  const tNode=document.getElementById('time'); if(tNode){ const v=String(Math.max(0, Math.ceil(game.time))); if (tNode.textContent!==v){ tNode.textContent=v; addFX(tNode); } }
}
function showBanner(text){ banner.textContent=text; banner.style.display='flex'; }
function hideBanner(){ banner.style.display='none'; }

function loseLife(reason){
  // 统一掉命与复活逻辑
  game.time = game.timeMax;
  if (!GAME_CONFIG.livesEnabled || game.lives===Infinity){ game.player.respawnAtSaved(); showBanner('继续'); setTimeout(hideBanner, 800); return; }
  game.lives = Math.max(0, (game.lives|0) - 1);
  updateHUD();
  if (game.lives > 0){ game.player.respawnAtSaved(); showBanner(`失去生命，剩余 ${game.lives}`); setTimeout(hideBanner, 800); }
  else {
    game.state = GameState.Lose; showBanner('GAME OVER - 按 R 继续');
  }
}

document.addEventListener('keydown', (e)=>{ sfx.initOnUserGesture(); const block=['Space','KeyX']; if(block.includes(e.code)) e.preventDefault(); if(e.code==='KeyP'){ if(game.state===GameState.Playing){ game.state=GameState.Paused; showBanner('已暂停 P 继续'); } else if (game.state===GameState.Paused){ game.state=GameState.Playing; hideBanner(); } } if(e.code==='KeyR'){ if(game.state===GameState.Win || game.state===GameState.Lose){ if (game.state===GameState.Lose && GAME_CONFIG.livesEnabled){ game.lives = GAME_CONFIG.initialLives|0; updateHUD(); } loadLevel(); hideBanner(); } else { game.resetRequested=true; } } if (e.code==='KeyE'){ if (!game.editor) game.editor = new LevelEditor(game, canvas, game.renderer); game.editor.toggle(); if (game.editor.active) showBanner('编辑器模式 E 退出'); else hideBanner(); } if (e.code==='KeyM'){ if (game.state!==GameState.Select){ game.state=GameState.Select; game._selectingWorld=true; showBanner('世界选择：按 1~8 跳转，M 退出'); } else { game.state=GameState.Playing; game._selectingWorld=false; hideBanner(); } } if (game._selectingWorld && /^Digit[1-8]$/.test(e.code)){ const idx=parseInt(e.code.slice(5))-1; game.currentLevelIndex=Math.max(0,Math.min(idx,7)); hideBanner(); game.state=GameState.Playing; loadLevel(); } if (e.code==='KeyO'){ // 快照下载
  const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=`snapshot-${Date.now()}.png`; a.click(); } });
const touch=document.getElementById('touch'); if(touch){ const apply=(el,on)=>{ const key=el.dataset.key; const handler=(ev)=>{ ev.preventDefault(); game.input.setVirtual(key,on);} ; el.addEventListener('touchstart',handler,{passive:false}); el.addEventListener('touchend',(ev)=>{ev.preventDefault(); game.input.setVirtual(key,false);},{passive:false}); el.addEventListener('touchcancel',(ev)=>{ev.preventDefault(); game.input.setVirtual(key,false);},{passive:false}); el.addEventListener('mousedown',handler); el.addEventListener('mouseup',()=>game.input.setVirtual(key,false)); el.addEventListener('mouseleave',()=>game.input.setVirtual(key,false)); }; touch.querySelectorAll('button').forEach((btn)=>apply(btn,true)); }

const FIXED_DT = 1/60; let acc=0; let last=performance.now();
function frame(now){ const dt=Math.min(0.1,(now-last)/1000); last=now; if(game.state===GameState.Playing) acc+=dt; if(game.resetRequested){ loadLevel(); } while(acc>=FIXED_DT){ step(FIXED_DT); acc-=FIXED_DT; } render(); sfx.musicTick(); requestAnimationFrame(frame); }

function step(dt){
  const { level, player, entities, input, physics } = game;
  // 输入与玩家
  input.update();
  const prevBottom = player.y + player.h;
  const wasGrounded = player.grounded;
  const prevVx = player.vx;
  if (player.grounded && input.jumpPressed) sfx.jump();
  // 先更新移动平台位置
  for (const ent of entities) { if (ent.kind==='platform' && typeof ent.update==='function') ent.update(dt); }
  player.update(dt, input, physics, level);
  if ((game.level && game.level.theme) !== 'water' && !input.jump && player.vy < -120) player.vy *= 0.7;
  if (!wasGrounded && player.grounded) { game.particles.spark(player.x + player.w/2, player.y + player.h, '#cbd5e1', 6); game.particles.dust(player.x + player.w/2, player.y + player.h, '#e5e7eb', 10); }
  if (Math.abs(prevVx) > 150 && Math.sign(prevVx) !== Math.sign(player.vx) && player.grounded) { game.particles.dust(player.x + player.w/2, player.y + player.h, '#d1d5db', 10); game.particles.skid(player.x + player.w/2, player.y + player.h, Math.sign(prevVx), 6); }
  if (Math.abs(prevVx) < 20 && Math.abs(player.vx) > 80 && player.grounded) { game.particles.dust(player.x + player.w/2, player.y + player.h, '#e5e7eb', 8); game.particles.skid(player.x + player.w/2, player.y + player.h, Math.sign(player.vx)||1, 4); }

  // 计时与HUD
  game.time -= dt;
  if (game.time <= 0) { loseLife('timeout'); }
  if (game.time <= game.lowTimeThreshold) { sfx.musicSpeedUp(); if (hudRoot) hudRoot.classList.add('hud-low-time'); }
  else { if (typeof sfx.musicNormal === 'function') sfx.musicNormal(); if (hudRoot) hudRoot.classList.remove('hud-low-time'); }
  const sec = Math.max(0, Math.ceil(game.time));
  if (game.lastTimeSec !== sec) { if (sec <= game.alertLastSeconds) sfx.alertBeep(); game.lastTimeSec = sec; }
  updateHUD();

  // 顶砖
  const hh = player.lastHeadHit;
  if (hh) {
    const { x, y, tile } = hh;
    if (tile === 'B') {
      if (player.powered) { level.set(x, y, '-'); game.particles.burstRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE, '#a16207'); sfx.break(); game.score += 50; updateHUD(); }
      else sfx.bump();
    } else if (tile === 'Q' || tile==='M') {
      if (tile==='Q'){
        level.set(x, y, 'N');
        if (player.powered && !player.canShoot) { entities.push(new Flower(x*TILE_SIZE, (y-1)*TILE_SIZE)); sfx.powerup(); }
        else {
          const r = Math.random();
          if (r < 0.5) { const rc = new RewardCoin(x*TILE_SIZE+6, y*TILE_SIZE-8); entities.push(rc); game.coins += 1; game.score += 100; updateHUD(); sfx.coin(); }
          else if (r < 0.75) { entities.push(new Star(x*TILE_SIZE+6, y*TILE_SIZE-8)); sfx.star(); }
          else { entities.push(new Mushroom(x*TILE_SIZE, (y-1)*TILE_SIZE)); sfx.powerup(); }
        }
      } else {
        // 多金币砖：在时间窗口内可多次出币，用尽或超时后变 N
        if (!level._mcState) level._mcState = {};
        const key = `${x},${y}`;
        let st = level._mcState[key];
        if (!st) { const def=GAME_CONFIG.multiCoinDefault||{count:10,windowSec:6}; st = level._mcState[key] = { remain: def.count||10, timer: def.windowSec||6 }; }
        if (st.remain>0 && st.timer>0){
          const rc = new RewardCoin(x*TILE_SIZE+6, y*TILE_SIZE-8); entities.push(rc); game.coins += 1; game.score += 100; updateHUD(); sfx.coin(); st.remain -= 1;
          if (st.remain<=0){ level.set(x, y, 'N'); delete level._mcState[key]; }
        }
      }
    }
  }

  // 中途旗（K）：保存重生点
  const cpt = physics.rectFindTile(player, level, (t)=>t==='K');
  if (cpt && !level._checkpoint) {
    level._checkpoint = { x: cpt.x, y: cpt.y };
    // 以该处为重生点（旗子上方）
    const rx = cpt.x*TILE_SIZE + TILE_SIZE*0.5 - game.player.w/2;
    const ry = cpt.y*TILE_SIZE - game.player.h - 2;
    game.player.respawnX = rx; game.player.respawnY = ry;
    // 存档checkpoint
    try { const levelId = (typeof getLevelId === 'function' ? getLevelId(game.currentLevelIndex) : undefined) || (WORLD_MAP[game.currentLevelIndex]||'1-1'); if (typeof saveCheckpoint === 'function') saveCheckpoint(levelId, { x: Math.floor(rx), y: Math.floor(ry) }); } catch {}
    level.set(cpt.x, cpt.y, '-');
    showBanner('到达中途旗'); setTimeout(hideBanner, 600);
  }

  // 更新实体与粒子
  for (const ent of entities) { if (typeof ent.update === 'function') ent.update(dt, physics, level, player, entities); }
  game.particles.update(dt);

  // 平台承载：从上方落到平台则站稳并随平台移动
  for (const ent of entities) {
    if (ent.kind !== 'platform') continue;
    const overlap = !(player.x + player.w <= ent.x || player.x >= ent.x + ent.w || player.y + player.h <= ent.y || player.y >= ent.y + ent.h);
    if (overlap) {
      const wasAbove = prevBottom <= ent.y + 4 && player.vy >= 0;
      if (wasAbove) {
        player.y = ent.y - player.h; player.vy = 0; player.grounded = true;
        // 随平台水平移动
        if (ent.dx) player.x += ent.dx;
      } else {
        // 简单侧向分离，避免夹入
        if (player.x + player.w/2 < ent.x + ent.w/2) player.x = ent.x - player.w - 0.01; else player.x = ent.x + ent.w + 0.01;
      }
    }
  }

  // 子弹命中
  for (const ent of entities) {
    if (ent.kind !== 'bullet' || ent.dead) continue;
    for (const target of entities) {
      if ((target.kind !== 'enemy' && target.kind !== 'koopa' && target.kind !== 'shell' && target.kind!=='cheep' && target.kind!=='blooper' && target.kind!=='bill' && target.kind!=='hammer-bro' && target.kind!=='lakitu' && target.kind!=='spiny') || target.dead) continue;
      if (physics.aabbOverlap(ent, target)) {
        if (target.kind === 'koopa') { const sh = new Shell(target.x, target.y + target.h - 22); sh.vx = Math.sign(ent.vx) * 240; target.dead = true; entities.push(sh); }
        else if (target.kind === 'shell') { target.vx = Math.sign(ent.vx) * 240; }
        else { target.dead = true; }
        ent.dead = true; game.score += 150; updateHUD(); game.particles.spark(target.x + target.w/2, target.y + target.h/2, '#fb923c');
      }
    }
  }

  // 壳弹射
  for (const sh of entities) {
    if (sh.kind !== 'shell' || sh.dead) continue;
    if (Math.abs(sh.vx) > 120 && Math.random() < dt * 5) game.particles.spark(sh.x + sh.w/2, sh.y + sh.h, '#9ca3af', 3);
    if (Math.abs(sh.vx) < 1) continue;
    for (const target of entities) {
      if ((target.kind !== 'enemy' && target.kind !== 'koopa') || target.dead || target === sh) continue;
      if (physics.aabbOverlap(sh, target)) { target.dead = true; game.score += 200; updateHUD(); game.particles.spark(target.x + target.w/2, target.y + target.h/2, '#22c55e'); }
    }
  }

  // 清理死实体
  for (let i = entities.length - 1; i >= 0; i--) if (entities[i].dead) entities.splice(i, 1);

  // 火条碰撞（圆形近似）
  for (const ent of entities) {
    if (ent.kind !== 'firebar') continue;
    const balls = ent.balls(TILE_SIZE);
    const px = player.x + player.w/2, py = player.y + player.h/2; const pr = Math.min(player.w, player.h) * 0.45;
    for (const b of balls) { const dx = px - b.cx, dy = py - b.cy; if (dx*dx + dy*dy <= (pr + b.radius)*(pr + b.radius)) { if (player.invincibleTime > 0) {} else if (player.powered) { player.setPowered(false); } else { loseLife('hazard'); return; } } }
  }

  // 火焰喷口碰撞（矩形）
  for (const ent of entities) {
    if (ent.kind!=='flame-spout') continue;
    const r = ent.rect?.(); if (!r) continue;
    const overlap = !(player.x + player.w <= r.x || player.x >= r.x + r.w || player.y + player.h <= r.y || player.y >= r.y + r.h);
    if (overlap) { if (player.invincibleTime>0) {} else if (player.powered) { player.setPowered(false); } else { loseLife('flame'); return; } }
  }

  // 玩家与实体交互
  for (const ent of entities) {
    if (!physics.aabbOverlap(player, ent)) continue;
    if (ent.kind === 'coin') { ent.dead = true; game.coins += 1; game.score += 100; updateHUD(); sfx.coin(); }
    else if (ent.kind === 'mushroom') { ent.dead = true; player.setPowered(true); game.score += 300; updateHUD(); sfx.powerup(); }
    else if (ent.kind === 'flower') { ent.dead = true; player.setPowered(true); player.canShoot = true; game.score += 500; updateHUD(); sfx.powerup(); }
    else if (ent.kind === 'star') { ent.dead = true; player.invincibleTime = 10; game.score += 500; updateHUD(); sfx.star(); }
    else if (ent.kind === 'enemy' || ent.kind === 'koopa' || ent.kind === 'piranha' || ent.kind==='cheep' || ent.kind==='blooper' || ent.kind==='bill' || ent.kind==='hammer-bro' || ent.kind==='hammer' || ent.kind==='lakitu' || ent.kind==='spiny') {
      const stomping = (ent.kind !== 'piranha' && ent.kind !== 'spiny') && player.vy > 0 && player.bottom() - ent.top() < 16;
      if (stomping) { if (ent.kind === 'koopa') { ent.dead = true; entities.push(new Shell(ent.x, ent.y + ent.h - 22)); } else ent.dead = true; player.vy = -player.jumpSpeed * 0.6; game.score += 200; updateHUD(); sfx.stomp(); }
      else { if (player.invincibleTime > 0) { ent.dead = true; game.score += 200; updateHUD(); } else if (player.canShoot) { player.canShoot = false; if (typeof player.hurt === 'function') player.hurt(0.4); player.vy = -player.jumpSpeed * 0.3; } else if (player.powered) { player.setPowered(false); player.vy = -player.jumpSpeed * 0.5; } else { loseLife('enemy'); return; } }
    } else if (ent.kind === 'shell') {
      if (Math.abs(ent.vx) < 1) ent.vx = player.facing >= 0 ? 260 : -260; else if (player.invincibleTime <= 0) { if (player.canShoot) { player.canShoot = false; } else if (player.powered) player.setPowered(false); else { player.respawnAtSaved(); return; } }
    }
  }

  // 斧头-城堡桥坍塌演出（优先于旗杆）
  const axeTile = physics.rectFindTile(player, level, (t)=>t==='A');
  if (axeTile) {
    if (!game.winStage) {
      game.state=GameState.Win; game.winStage='castle_collapse';
      const row = (level.rows-3);
      const start=Math.max(0, axeTile.x-10), end=Math.max(0, axeTile.x-1);
      game._collapse={ row, cols:[], idx:0, timer:0 };
      for(let c=end;c>=start;c--) game._collapse.cols.push(c);
      game._timeAtFlagSec = Math.max(0, Math.ceil(game.time));
    }
    if (game.winStage==='castle_collapse'){
      game._collapse.timer += dt;
      if (game._collapse.timer>=0.06){ game._collapse.timer=0; const col=game._collapse.cols[game._collapse.idx++]; if (col!==undefined){ level.set(col, game._collapse.row, '-'); sfx.break(); } else { game.winStage='count'; } }
    }
  }

  // 旗杆演出与推进
  const flagTile = physics.rectFindTile(player, level, (t)=>t==='F');
  if (flagTile) {
    if (!game.winStage) {
      game.state = GameState.Win; game.winStage = 'slide';
      const poleTop=(flagTile.y*TILE_SIZE)-3*TILE_SIZE; const poleBottom=(flagTile.y*TILE_SIZE)+TILE_SIZE; const touchY=Math.min(Math.max(player.y+player.h/2, poleTop), poleBottom); const ratio=1-(touchY-poleTop)/(poleBottom-poleTop);
      const __meta = (typeof getLevelMeta === 'function') ? getLevelMeta(game.currentLevelIndex) : undefined; const tiers = (level.flagBonus)||((__meta && __meta.flagBonus) || [100,400,800,2000,5000]);
      game.flagBonus = (ratio>0.9?tiers[4]: ratio>0.7?tiers[3]: ratio>0.5?tiers[2]: ratio>0.3?tiers[1]: tiers[0]);
      // 记录旗杆位置与触旗时的剩余整秒，供烟花判定
      game._flagX = flagTile.x*TILE_SIZE; game._timeAtFlagSec = Math.max(0, Math.ceil(game.time));
      player.x = flagTile.x*TILE_SIZE + TILE_SIZE*0.45 - player.w/2; player.vx=0; player.vy=0; game._flagBottom=(flagTile.y*TILE_SIZE)+TILE_SIZE - player.h - 2;
    }
    if (game.winStage === 'slide') { if (player.y < game._flagBottom) { player.y = Math.min(game._flagBottom, player.y + GAME_CONFIG.flagSlideSpeed*dt); player.pose='slide'; if (Math.random() < dt*12) game.particles.dust(player.x + player.w*0.5, player.y + player.h, '#e5e7eb', 6); } else game.winStage = 'count'; }
    else if (game.winStage === 'count') {
      if (game.time > 0) {
        const before = Math.ceil(game.time);
        const drain = Math.min(game.time, GAME_CONFIG.settleDrainPerSec*dt);
        game.time -= drain;
        const after = Math.ceil(Math.max(0, game.time));
        const delta = Math.max(0, before - after);
        if (delta>0) { game.score += delta * (game.timeBonusPerSecond||GAME_CONFIG.timeBonusPerSecond); sfx.alertBeep(); }
        updateHUD();
      } else {
        // 切入庆祝阶段（COURSE CLEAR!）
        game.winStage = 'celebrate';
        game.score += game.flagBonus; updateHUD(); sfx.win();
        if (typeof sfx.victoryJingle === 'function') sfx.victoryJingle();
        const d = (game._timeAtFlagSec||0) % 10; game._fwRemain = (d===1?1:(d===3?3:(d===6?6:0))); game._fwTimer = 0; game._nextCountdown = 3; game._celebrateTick = 0;
        if (game.currentLevelIndex===0) { game._nextMsg='COURSE CLEAR! 1-1 通关！{n} 秒后进入 1-2（按 R 立即进入）'; game.currentLevelIndex=1; }
        else if (game.currentLevelIndex===1) { game._nextMsg='COURSE CLEAR! 1-2 通关！{n} 秒后进入 1-3（按 R 立即进入）'; game.currentLevelIndex=2; }
        else if (game.currentLevelIndex===2) { game._nextMsg='COURSE CLEAR! 1-3 通关！{n} 秒后进入 1-4（按 R 立即进入）'; game.currentLevelIndex=3; }
        else { game._nextMsg='COURSE CLEAR! 全部通关！{n} 秒后回到 1-1（按 R 立即进入）'; game.currentLevelIndex=0; }
        showBanner(game._nextMsg.replace('{n}', String(game._nextCountdown)));
        // 入城门/淡出短演出
        game._fadeAlpha = 0; game._doorTimer = 0.9;
      }
    }
    else if (game.winStage === 'celebrate') {
      // 烟花：按节奏依次绽放
      if (game._fwTimer>0) game._fwTimer -= dt;
      if (game._fwRemain>0 && game._fwTimer<=0) {
        // 抖动节奏：0.24~0.5s 随机间隔，数量逐渐靠近0
        game._fwTimer = 0.24 + Math.random()*0.26; game._fwRemain--;
        const flagX = (game._flagX||player.x);
        // 三个分层簇：左/中/右（相对旗杆位置）
        const cluster = Math.floor(Math.random()*3); // 0 L 1 C 2 R
        const clusterOff = cluster===0? 40 : (cluster===1? 140 : 220);
        const baseX = flagX + clusterOff;
        const baseY = Math.max(40, player.y - 140);
        // 远近深度：影响尺寸与速度
        const depth = [0.7, 0.9, 1.1][Math.floor(Math.random()*3)];
        const size = Math.max(2, Math.round(3*depth));
        const speed = 220 + Math.round((depth-0.7)*180);
        const fx = baseX + (Math.random()*40-20);
        const fy = baseY - Math.random()*60 - (cluster===1? 0 : (cluster===2? 8: -6));
        const hue = Math.random()<0.5? '#fcd34d' : (Math.random()<0.5? '#fb7185':'#60a5fa');
        game.particles.burstRect(fx, fy, 10, 10, hue, 8+Math.round(Math.random()*4), speed, size); sfx.firework();
        const add = (GAME_CONFIG.fireworkScore||500); game.score += add; updateHUD(); game.particles.text(fx, fy-14, `+${add}`, hue, 0.9);
        // 偶尔并发第二朵（不同深度/小偏移），制造“偶然性”
        if (Math.random() < 0.22) {
          const depth2 = [0.6, 0.85, 1.0][Math.floor(Math.random()*3)];
          const size2 = Math.max(2, Math.round(3*depth2));
          const sp2 = 200 + Math.round((depth2-0.6)*200);
          const fx2 = baseX + (Math.random()*60-30); const fy2 = baseY - Math.random()*60;
          setTimeout(()=>{ try{ game.particles.burstRect(fx2, fy2, 10, 10, hue, 6+Math.round(Math.random()*4), sp2, size2); sfx.firework(); }catch{} }, 80+Math.random()*140);
        }
      }
      // 倒计时自动进入下一关
      game._celebrateTick += dt;
      // 入门奔跑与淡出
      if (game._doorTimer!=null && game._doorTimer>0){ game._doorTimer-=dt; player.x = Math.min(player.x + 80*dt, level.cols*TILE_SIZE - player.w - 1); player.pose='run'; game._fadeAlpha = Math.min(1, (game._fadeAlpha||0) + dt/0.9); }
      if (game._celebrateTick>=1) { game._celebrateTick=0; game._nextCountdown = Math.max(0, (game._nextCountdown||0)-1); showBanner(game._nextMsg.replace('{n}', String(game._nextCountdown))); }
      if ((game._nextCountdown||0) <= 0) { hideBanner(); try { if (typeof saveCurrentLevel === 'function') saveCurrentLevel(game.currentLevelIndex); const levelId2 = (typeof getLevelId === 'function') ? getLevelId(game.currentLevelIndex) : undefined; if (levelId2 && typeof clearCheckpoint === 'function') clearCheckpoint(levelId2); } catch {}; loadLevel(); }
    }
  }

  // 射击
  if (input.shootPressed && (player.powered || player.canShoot)) { const now=performance.now(); if (now - game.lastShotAt > 200) { game.lastShotAt = now; const dir = player.facing >= 0 ? 1 : -1; const b = new Bullet(player.x + player.w/2, player.y + player.h*0.45, dir); entities.push(b); sfx.shoot(); } }

  // 管道进出
  const pipe = physics.rectFindTile(player, level, (t)=>t==='V');
  if (pipe && input.downPressed && typeof level.activate==='function' && level.activeRoom==='main' && level.sub) { level.activate('sub'); game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE); game.player.x = level.spawn.x; game.player.y = level.spawn.y; game.player.vx = 0; game.player.vy = 0; if (!level._spawnedSub && level.getSpawns) { for (const e of level.getSpawns()) { if (e.type==='enemy') entities.push(new Enemy(e.x,e.y)); if (e.type==='coin') entities.push(new Coin(e.x,e.y)); if (e.type==='mushroom') entities.push(new Mushroom(e.x,e.y)); if (e.type==='koopa') entities.push(new Koopa(e.x,e.y)); if (e.type==='star') entities.push(new Star(e.x,e.y)); } level._spawnedSub = true; } showBanner('进入地下'); setTimeout(hideBanner, 600); }
  const exit = physics.rectFindTile(player, level, (t)=>t==='X');
  if (exit && typeof level.activate==='function' && level.activeRoom==='sub') { level.activate('main'); game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE); game.player.x = level.returnPoint ? level.returnPoint.x : level.spawn.x; game.player.y = level.returnPoint ? level.returnPoint.y : level.spawn.y; game.player.vx = 0; game.player.vy = 0; showBanner('返回地面'); setTimeout(hideBanner, 600); }

  // Warp 区触发
  for (const ent of entities) {
    if (ent.kind==='warp') {
      const inside = !(player.x + player.w <= ent.x || player.x >= ent.x + ent.w || player.y + player.h <= ent.y || player.y >= ent.y + ent.h);
      if (inside && input.downPressed) {
        const to = Math.max(0, Math.min(ent.to|0, WORLD_MAP.length-1));
        game.currentLevelIndex = to; hideBanner(); loadLevel(); return;
      }
    }
  }

  // 摄像机
  game.renderer.cameraFollow(player);
  if (level.autoScrollSpeed && level.autoScrollSpeed>0){
    game.renderer.nudgeCamera(level.autoScrollSpeed*dt, 0);
    const leftBound = game.renderer.camera.x + 8;
    if (player.x + player.w/2 < leftBound){ loseLife('scroll'); return; }
  }
  game.renderer.updateCamera(dt);
}

function render(){ const { renderer, level, player, entities } = game; renderer.clear();
  // 庆祝阶段额外旗帜摆幅
  renderer._flagWaveExtra = (game.winStage==='celebrate') ? 5 : 0;
  renderer.drawBackground(level); renderer.drawLevel(level);
  for(const ent of entities) renderer.drawEntity(ent); renderer.drawEntity(player);
  game.particles.draw(renderer.ctx, renderer.camera);
  if (game.editor && game.editor.active) game.editor.drawOverlay(renderer.ctx);
  if (game.winStage==='count') { game.ui.drawSettlement(renderer.canvas.width, renderer.canvas.height, { time: Math.ceil(Math.max(0, game.time)), score: game.score, flagBonus: game.flagBonus }); }
  if (game.winStage==='celebrate'){ const ctx=renderer.ctx; ctx.save(); ctx.fillStyle=`rgba(0,0,0,${Math.max(0,Math.min(1, game._fadeAlpha||0))})`; ctx.fillRect(0,0,renderer.canvas.width,renderer.canvas.height); ctx.restore(); }
}

loadLevel(); requestAnimationFrame(frame);
  // 多金币砖计时衰减
  if (level._mcState){ for (const k of Object.keys(level._mcState)){ const st=level._mcState[k]; st.timer -= dt; if (st.timer<=0){ const [sx,sy]=k.split(',').map(n=>parseInt(n)); level.set(sx, sy, 'N'); delete level._mcState[k]; } } }
