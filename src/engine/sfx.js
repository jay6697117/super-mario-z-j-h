// 简易音效系统：WebAudio 合成“哔”音 + 极简 BGM 节拍
class SFX {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.master = null;
    this._music = { on: false, speed: 1, lastTick: 0 };
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

  jump() { this.bip({ freq: 500, dur: 0.12, type: 'square' }); }
  coin() { this.bip({ freq: 900, dur: 0.09, type: 'triangle' }); }
  stomp() { this.bip({ freq: 200, dur: 0.08, type: 'sawtooth' }); }
  powerup() { this.bip({ freq: 650, dur: 0.18, type: 'square' }); }
  shoot() { this.bip({ freq: 750, dur: 0.06, type: 'square' }); }
  win() { this.bip({ freq: 800, dur: 0.25, type: 'triangle' }); }
  bump() { this.bip({ freq: 420, dur: 0.06, type: 'square' }); }
  break() { this.bip({ freq: 300, dur: 0.14, type: 'sawtooth' }); }
  star() { this.bip({ freq: 1000, dur: 0.15, type: 'triangle' }); }

  musicStart() { if (!this.ctx) return; this._music.on = true; this._music.speed = 1; this._music.lastTick = this.ctx.currentTime; }
  musicSpeedUp() { this._music.speed = 1.5; }
  musicStop() { this._music.on = false; }
  musicTick() {
    if (!this.ctx || !this._music.on) return;
    const now = this.ctx.currentTime;
    const interval = 0.5 / this._music.speed; // 120bpm 基础
    if (now - this._music.lastTick >= interval) { this._music.lastTick = now; this.bip({ freq: 523, dur: 0.04, type: 'triangle' }); }
  }
  alertBeep() { this.bip({ freq: 950, dur: 0.05, type: 'square' }); }
}

export const sfx = new SFX();

