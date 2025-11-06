// 结算与七段数码管UI
import { GAME_CONFIG } from '../config.js';

function digitMask(n){
  // 返回需要点亮的段：a,b,c,d,e,f,g -> 位 0..6
  // 0b g f e d c b a
  const map = [
    0b0111111, // 0: a b c d e f
    0b0000110, // 1: b c
    0b1011011, // 2: a b d e g
    0b1001111, // 3: a b c d g
    0b1100110, // 4: b c f g
    0b1101101, // 5: a c d f g
    0b1111101, // 6: a c d e f g
    0b0000111, // 7: a b c
    0b1111111, // 8: all
    0b1101111, // 9: a b c d f g
  ];
  return map[n] || 0;
}

export class GameUI {
  constructor(ctx){ this.ctx = ctx; }

  drawDigit(x, y, d, size, thick, color){
    const ctx = this.ctx; const s=size; const t=thick; const m=digitMask(d);
    ctx.fillStyle = color;
    // 段定义：a顶、b右上、c右下、d底、e左下、f左上、g中
    if (m & 0b0000001) ctx.fillRect(x + t,       y,            s - t*2, t);                // a
    if (m & 0b0000010) ctx.fillRect(x + s - t,   y + t,        t,        s/2 - t);        // b
    if (m & 0b0000100) ctx.fillRect(x + s - t,   y + s/2 + t,  t,        s/2 - t);        // c
    if (m & 0b0001000) ctx.fillRect(x + t,       y + s,        s - t*2,  t);              // d
    if (m & 0b0010000) ctx.fillRect(x,           y + s/2 + t,  t,        s/2 - t);        // e
    if (m & 0b0100000) ctx.fillRect(x,           y + t,        t,        s/2 - t);        // f
    if (m & 0b1000000) ctx.fillRect(x + t,       y + s/2,      s - t*2,  t);              // g
  }

  drawNumber(x, y, value, digits, color){
    const s = GAME_CONFIG.settleSegSize; const t = GAME_CONFIG.settleSegThick; const gap = Math.floor(s*0.4);
    const str = String(Math.max(0, Math.floor(value))).padStart(digits, '0');
    for (let i=0;i<str.length;i++){
      const n = parseInt(str[i], 10);
      this.drawDigit(x + i*(s+gap), y, n, s, t, color);
    }
  }

  drawLabel(x, y, text, color, size=18){
    const ctx=this.ctx; ctx.fillStyle=color; ctx.font=`bold ${size}px sans-serif`; ctx.textBaseline='top'; ctx.fillText(text, x, y);
  }

  drawSettlement(canvasW, canvasH, { time, score, flagBonus }){
    const ctx=this.ctx;
    // 半透明遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,0.70)';
    ctx.fillRect(0,0,canvasW,canvasH);

    const centerX = Math.floor(canvasW*0.5);
    const baseY = Math.floor(canvasH*0.28);
    const color = '#facc15';
    const white = '#e2e8f0';

    // 标题
    this.drawLabel(centerX-90, baseY-36, 'STAGE CLEAR', white, 22);

    // TIME
    this.drawLabel(centerX-180, baseY+10, 'TIME', white, 16);
    this.drawNumber(centerX-100, baseY, time, GAME_CONFIG.settleDigitsTime, color);

    // SCORE
    this.drawLabel(centerX-180, baseY+70, 'SCORE', white, 16);
    this.drawNumber(centerX-100, baseY+60, score, GAME_CONFIG.settleDigitsScore, color);

    // BONUS（旗奖励）
    this.drawLabel(centerX-180, baseY+130, 'BONUS', white, 16);
    this.drawNumber(centerX-100, baseY+120, flagBonus, 4, color);

    ctx.restore();
  }
}

