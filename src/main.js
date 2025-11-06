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
import { GameUI } from './engine/ui.js';
import { LevelEditor } from './tools/editor.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudScore = document.getElementById('score');
const hudCoins = document.getElementById('coins');
const hudLives = document.getElementById('lives');
const hudLevel = document.getElementById('level');
const banner = document.getElementById('banner');
const hudRoot = document.getElementById('hud');

const GameState = { Playing: 'playing', Paused: 'paused', Win: 'win', Lose: 'lose' };
const game = { state: GameState.Playing, level:null, input:new Input(), renderer:new Renderer(canvas, ctx), physics:new Physics(), particles:new Particles(), player:null, entities:[], score:0, coins:0, lives:Infinity, resetRequested:false, currentLevelIndex:0, lastShotAt:0, time:300, timeMax:300, lastTimeSec:null, winStage:null, flagBonus:0, ui:new GameUI(ctx), lowTimeThreshold: GAME_CONFIG.lowTimeThreshold, alertLastSeconds: GAME_CONFIG.alertLastSeconds, timeBonusPerSecond: GAME_CONFIG.timeBonusPerSecond, editor:null };

function getLevelByIndex(i){ if(i===0) return createLevel1(); if(i===1) return createLevel2(); if(i===2) return createLevel3(); if(i===3) return createLevel4(); return createLevel1(); }
const WORLD_MAP = WORLD_MAP_DATA;
// 读取存档的当前关卡
try { const savedIndex = loadCurrentLevel(); if (typeof savedIndex==='number') game.currentLevelIndex = Math.max(0, Math.min(savedIndex, WORLD_MAP.length-1)); } catch {}
function loadLevel(){
  const level=getLevelByIndex(game.currentLevelIndex);
  game.level=level;
  if(typeof level.activate==='function') level.activate('main');
  game.entities.length=0;
  // 玩家初始出生点（支持存档checkpoint覆盖）
  const levelId = getLevelId?.(game.currentLevelIndex) || (WORLD_MAP[game.currentLevelIndex]||'1-1');
  const cp = loadCheckpoint?.(levelId);
  const spawnX = (cp?.x != null) ? cp.x : level.spawn.x;
  const spawnY = (cp?.y != null) ? cp.y : level.spawn.y;
  game.player=new Player(spawnX, spawnY);
  for(const e of (level.getSpawns? level.getSpawns(): level.spawns)){
    if(e.type==='enemy') game.entities.push(new Enemy(e.x,e.y));
    if(e.type==='koopa') game.entities.push(new Koopa(e.x,e.y));
    if(e.type==='coin') game.entities.push(new Coin(e.x,e.y));
    if(e.type==='mushroom') game.entities.push(new Mushroom(e.x,e.y));
    if(e.type==='flower') game.entities.push(new Flower(e.x,e.y));
    if(e.type==='piranha') game.entities.push(new Piranha(e.x, e.y));
    if(e.type==='star') game.entities.push(new Star(e.x,e.y));
    if(e.type==='firebar') game.entities.push(new FireBar(e.x, e.y, e.segments, e.speed));
    if(e.type==='cheep') game.entities.push(new Cheep(e.x,e.y,e.dir||-1));
    if(e.type==='blooper') game.entities.push(new Blooper(e.x,e.y));
    if(e.type==='cannon') game.entities.push(new Cannon(e.x,e.y,e.dir||-1,e.period||2.2));
    if(e.type==='hammer-bro') game.entities.push(new HammerBro(e.x,e.y));
    if(e.type==='lakitu') game.entities.push(new Lakitu(e.x,e.y));
    if(e.type==='spiny') game.entities.push(new Spiny(e.x,e.y));
  }
  game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE);
  game.renderer.cameraFollow(game.player);
  game.state=GameState.Playing;
  game.score=0; game.coins=0; game.lives=Infinity; game.resetRequested=false; game.winStage=null;
  hudLevel.textContent = WORLD_MAP[game.currentLevelIndex]||'1-1';
  const __meta = getLevelMeta?.(game.currentLevelIndex);
  const __tl = (__meta && __meta.timeLimit)!=null? __meta.timeLimit : (level.timeLimit||300);
  game.time=game.timeMax=__tl;
  game.lowTimeThreshold = (__meta && __meta.lowTimeThreshold)!=null ? __meta.lowTimeThreshold : GAME_CONFIG.lowTimeThreshold;
  game.alertLastSeconds = (__meta && __meta.alertLastSeconds)!=null ? __meta.alertLastSeconds : GAME_CONFIG.alertLastSeconds;
  game.timeBonusPerSecond = (__meta && __meta.timeBonusPerSecond)!=null ? __meta.timeBonusPerSecond : GAME_CONFIG.timeBonusPerSecond;
  game.lastTimeSec=Math.ceil(game.time);
  updateHUD(); hideBanner(); sfx.musicStart();
}
function updateHUD(){ hudScore.textContent=String(game.score); hudCoins.textContent=String(game.coins); hudLives.textContent='∞'; const tNode=document.getElementById('time'); if(tNode) tNode.textContent=String(Math.max(0, Math.ceil(game.time))); }
function showBanner(text){ banner.textContent=text; banner.style.display='flex'; }
function hideBanner(){ banner.style.display='none'; }

document.addEventListener('keydown', (e)=>{ sfx.initOnUserGesture(); const block=['Space','KeyX']; if(block.includes(e.code)) e.preventDefault(); if(e.code==='KeyP'){ if(game.state===GameState.Playing){ game.state=GameState.Paused; showBanner('已暂停 P 继续'); } else if (game.state===GameState.Paused){ game.state=GameState.Playing; hideBanner(); } } if(e.code==='KeyR'){ if(game.state===GameState.Win || game.state===GameState.Lose){ loadLevel(); hideBanner(); } else { game.resetRequested=true; } } if (e.code==='KeyE'){ if (!game.editor) game.editor = new LevelEditor(game, canvas, game.renderer); game.editor.toggle(); if (game.editor.active) showBanner('编辑器模式 E 退出'); else hideBanner(); } if (e.code==='KeyO'){ // 快照下载
  const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=`snapshot-${Date.now()}.png`; a.click(); } });
const touch=document.getElementById('touch'); if(touch){ const apply=(el,on)=>{ const key=el.dataset.key; const handler=(ev)=>{ ev.preventDefault(); game.input.setVirtual(key,on);} ; el.addEventListener('touchstart',handler,{passive:false}); el.addEventListener('touchend',(ev)=>{ev.preventDefault(); game.input.setVirtual(key,false);},{passive:false}); el.addEventListener('touchcancel',(ev)=>{ev.preventDefault(); game.input.setVirtual(key,false);},{passive:false}); el.addEventListener('mousedown',handler); el.addEventListener('mouseup',()=>game.input.setVirtual(key,false)); el.addEventListener('mouseleave',()=>game.input.setVirtual(key,false)); }; touch.querySelectorAll('button').forEach((btn)=>apply(btn,true)); }

const FIXED_DT = 1/60; let acc=0; let last=performance.now();
function frame(now){ const dt=Math.min(0.1,(now-last)/1000); last=now; if(game.state===GameState.Playing) acc+=dt; if(game.resetRequested){ loadLevel(); } while(acc>=FIXED_DT){ step(FIXED_DT); acc-=FIXED_DT; } render(); sfx.musicTick(); requestAnimationFrame(frame); }

function step(dt){
  const { level, player, entities, input, physics } = game;
  // 输入与玩家
  input.update();
  const wasGrounded = player.grounded;
  const prevVx = player.vx;
  if (player.grounded && input.jumpPressed) sfx.jump();
  player.update(dt, input, physics, level);
  if (game.level?.theme !== 'water' && !input.jump && player.vy < -120) player.vy *= 0.7;
  if (!wasGrounded && player.grounded) game.particles.spark(player.x + player.w/2, player.y + player.h, '#cbd5e1', 6);
  if (Math.abs(prevVx) > 150 && Math.sign(prevVx) !== Math.sign(player.vx) && player.grounded) game.particles.spark(player.x + player.w/2, player.y + player.h, '#94a3b8', 8);

  // 计时与HUD
  game.time -= dt;
  if (game.time <= 0) { game.time = game.timeMax; player.respawnAtSaved(); showBanner('时间到！继续'); setTimeout(hideBanner, 800); }
  if (game.time <= game.lowTimeThreshold) { sfx.musicSpeedUp(); if (hudRoot) hudRoot.classList.add('hud-low-time'); }
  else { sfx.musicNormal?.(); if (hudRoot) hudRoot.classList.remove('hud-low-time'); }
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
    } else if (tile === 'Q') {
      level.set(x, y, 'N');
      if (player.powered && !player.canShoot) { entities.push(new Flower(x*TILE_SIZE, (y-1)*TILE_SIZE)); sfx.powerup(); }
      else {
        const r = Math.random();
        if (r < 0.5) { const rc = new RewardCoin(x*TILE_SIZE+6, y*TILE_SIZE-8); entities.push(rc); game.coins += 1; game.score += 100; updateHUD(); sfx.coin(); }
        else if (r < 0.75) { entities.push(new Star(x*TILE_SIZE+6, y*TILE_SIZE-8)); sfx.star(); }
        else { entities.push(new Mushroom(x*TILE_SIZE, (y-1)*TILE_SIZE)); sfx.powerup(); }
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
    try { const levelId = getLevelId?.(game.currentLevelIndex) || (WORLD_MAP[game.currentLevelIndex]||'1-1'); saveCheckpoint?.(levelId, { x: Math.floor(rx), y: Math.floor(ry) }); } catch {}
    level.set(cpt.x, cpt.y, '-');
    showBanner('到达中途旗'); setTimeout(hideBanner, 600);
  }

  // 更新实体与粒子
  for (const ent of entities) ent.update?.(dt, physics, level, player, entities);
  game.particles.update(dt);

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
    for (const b of balls) { const dx = px - b.cx, dy = py - b.cy; if (dx*dx + dy*dy <= (pr + b.radius)*(pr + b.radius)) { if (player.invincibleTime > 0) {} else if (player.powered) { player.setPowered(false); } else { player.respawnAtSaved(); return; } } }
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
      else { if (player.invincibleTime > 0) { ent.dead = true; game.score += 200; updateHUD(); } else if (player.canShoot) { player.canShoot = false; player.hurt?.(0.4); player.vy = -player.jumpSpeed * 0.3; } else if (player.powered) { player.setPowered(false); player.vy = -player.jumpSpeed * 0.5; } else { player.respawnAtSaved(); return; } }
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
    }
    if (game.winStage==='castle_collapse'){
      game._collapse.timer += dt;
      if (game._collapse.timer>=0.06){ game._collapse.timer=0; const col=game._collapse.cols[game._collapse.idx++]; if (col!==undefined){ level.set(col, game._collapse.row, '-'); sfx.break(); } else { game.winStage='count'; } }
    }
  }

  // 旗杆演出与推进
  const flagTile = physics.rectFindTile(player, level, (t)=>t==='F');
  if (flagTile) {
    if (!game.winStage) { game.state = GameState.Win; game.winStage = 'slide'; const poleTop=(flagTile.y*TILE_SIZE)-3*TILE_SIZE; const poleBottom=(flagTile.y*TILE_SIZE)+TILE_SIZE; const touchY=Math.min(Math.max(player.y+player.h/2, poleTop), poleBottom); const ratio=1-(touchY-poleTop)/(poleBottom-poleTop); const __meta = getLevelMeta?.(game.currentLevelIndex); const tiers = (__meta && __meta.flagBonus) || [100,400,800,2000,5000]; game.flagBonus = (ratio>0.9?tiers[4]: ratio>0.7?tiers[3]: ratio>0.5?tiers[2]: ratio>0.3?tiers[1]: tiers[0]); player.x = flagTile.x*TILE_SIZE + TILE_SIZE*0.45 - player.w/2; player.vx=0; player.vy=0; game._flagBottom=(flagTile.y*TILE_SIZE)+TILE_SIZE - player.h - 2; }
    if (game.winStage === 'slide') { if (player.y < game._flagBottom) { player.y = Math.min(game._flagBottom, player.y + GAME_CONFIG.flagSlideSpeed*dt); player.pose='slide'; } else game.winStage = 'count'; }
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
        game.winStage = 'done';
        game.score += game.flagBonus;
        updateHUD(); sfx.win();
        if (game.currentLevelIndex===0) { showBanner('1-1 通关！R 进入 1-2'); game.currentLevelIndex=1; }
        else if (game.currentLevelIndex===1) { showBanner('1-2 通关！R 进入 1-3'); game.currentLevelIndex=2; }
        else if (game.currentLevelIndex===2) { showBanner('1-3 通关！R 进入 1-4'); game.currentLevelIndex=3; }
        else { showBanner('全部通关！R 重玩'); game.currentLevelIndex=0; }
        try { saveCurrentLevel?.(game.currentLevelIndex); const levelId = getLevelId?.(game.currentLevelIndex); if (levelId) clearCheckpoint?.(levelId); } catch {}
      }
    }
  }

  // 射击
  if (input.shootPressed && (player.powered || player.canShoot)) { const now=performance.now(); if (now - game.lastShotAt > 200) { game.lastShotAt = now; const dir = player.facing >= 0 ? 1 : -1; const b = new Bullet(player.x + player.w/2, player.y + player.h*0.45, dir); entities.push(b); sfx.shoot(); } }

  // 管道进出
  const pipe = physics.rectFindTile(player, level, (t)=>t==='V');
  if (pipe && input.downPressed && typeof level.activate==='function' && level.activeRoom==='main' && level.sub) { level.activate('sub'); game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE); game.player.x = level.spawn.x; game.player.y = level.spawn.y; game.player.vx = 0; game.player.vy = 0; if (!level._spawnedSub && level.getSpawns) { for (const e of level.getSpawns()) { if (e.type==='enemy') entities.push(new Enemy(e.x,e.y)); if (e.type==='coin') entities.push(new Coin(e.x,e.y)); if (e.type==='mushroom') entities.push(new Mushroom(e.x,e.y)); if (e.type==='koopa') entities.push(new Koopa(e.x,e.y)); if (e.type==='star') entities.push(new Star(e.x,e.y)); } level._spawnedSub = true; } showBanner('进入地下'); setTimeout(hideBanner, 600); }
  const exit = physics.rectFindTile(player, level, (t)=>t==='X');
  if (exit && typeof level.activate==='function' && level.activeRoom==='sub') { level.activate('main'); game.renderer.setWorldSize(level.cols*TILE_SIZE, level.rows*TILE_SIZE); game.player.x = level.returnPoint ? level.returnPoint.x : level.spawn.x; game.player.y = level.returnPoint ? level.returnPoint.y : level.spawn.y; game.player.vx = 0; game.player.vy = 0; showBanner('返回地面'); setTimeout(hideBanner, 600); }

  // 摄像机
  game.renderer.cameraFollow(player);
  game.renderer.updateCamera(dt);
}

function render(){ const { renderer, level, player, entities } = game; renderer.clear(); renderer.drawBackground(level); renderer.drawLevel(level); for(const ent of entities) renderer.drawEntity(ent); renderer.drawEntity(player); game.particles.draw(renderer.ctx, renderer.camera); if (game.editor && game.editor.active) game.editor.drawOverlay(renderer.ctx); if (game.winStage==='count') { game.ui.drawSettlement(renderer.canvas.width, renderer.canvas.height, { time: Math.ceil(Math.max(0, game.time)), score: game.score, flagBonus: game.flagBonus }); } }

loadLevel(); requestAnimationFrame(frame);
