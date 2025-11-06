// 简易音效系统：WebAudio 合成“哔”音 + 极简 BGM 节拍
class SFX {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.master = null;
    this._music = { on: false, speed: 1, lastTick: 0, mode: 'normal' };
  }

  initOnUserGesture() {
    if (this.unlocked) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.2;
      this.master.connect(this.ctx.destination);
    }
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.master);
    src.start(0);
    this.unlocked = true;
  }

  bip({ freq = 600, dur = 0.08, type = 'square', decay = 0.003 } = {}) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(1, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(this.master); o.start(now); o.stop(now + dur + decay);
  }
  bipAt(when, { freq = 600, dur = 0.1, type = 'square' } = {}) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(1, when); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(this.master); o.start(when); o.stop(when + dur + 0.02);
  }

  jump() { this.bip({ freq: 500, dur: 0.12, type: 'square' }); }
  coin() { this.bip({ freq: 900, dur: 0.09, type: 'triangle' }); }
  stomp() { this.bip({ freq: 200, dur: 0.08, type: 'sawtooth' }); }
  powerup() { this.bip({ freq: 650, dur: 0.18, type: 'square' }); }
  shoot() { this.bip({ freq: 750, dur: 0.06, type: 'square' }); }
  win() { this.bip({ freq: 800, dur: 0.25, type: 'triangle' }); }
  bump() { this.bip({ freq: 420, dur: 0.06, type: 'square' }); }
  break() { this.bip({ freq: 300, dur: 0.14, type: 'sawtooth' }); }
  star() { this.bip({ freq: 1000, dur: 0.15, type: 'triangle' }); }
  firework() { this.bip({ freq: 740, dur: 0.06, type: 'square' }); this.bip({ freq: 392, dur: 0.08, type: 'triangle' }); }

  musicStart() { if (!this.ctx) return; this._music.on = true; this._music.speed = 1; this._music.mode = 'normal'; this._music.lastTick = this.ctx.currentTime; }
  musicSpeedUp() { this._music.speed = 1.5; this._music.mode = 'low'; }
  musicNormal() { this._music.speed = 1; this._music.mode = 'normal'; }
  musicStop() { this._music.on = false; }
  musicTick() {
    if (!this.ctx || !this._music.on) return;
    const now = this.ctx.currentTime;
    // 120bpm 基础，根据模式/速度调整
    const interval = 0.5 / this._music.speed;
    if (now - this._music.lastTick >= interval) {
      this._music.lastTick = now;
      const base = this._music.mode === 'low' ? 740 : 523; // 低时限更高音
      const dur = this._music.mode === 'low' ? 0.045 : 0.04;
      const type = this._music.mode === 'low' ? 'square' : 'triangle';
      this.bip({ freq: base, dur, type });
      if (this._music.mode === 'low') {
        // 叠加一个更短的弱音，制造紧迫感
        this.bip({ freq: base*1.26|0, dur: 0.025, type: 'square' });
      }
    }
  }
  victoryJingle() {
    if (!this.ctx) return; const t0 = this.ctx.currentTime + 0.02;
    const seq = [523, 659, 784, 1046]; // C5 E5 G5 C6
    const step = 0.16; for (let i=0;i<seq.length;i++) this.bipAt(t0 + i*step, { freq: seq[i], dur: 0.12, type: 'triangle' });
  }
  alertBeep() { this.bip({ freq: 950, dur: 0.05, type: 'square' }); }
}

export const sfx = new SFX();
