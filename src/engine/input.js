export class Input {
  constructor() {
    this.keys = new Map();
    this.prevKeys = new Map();
    this.left = this.right = this.jump = this.shoot = this.run = false;
    this.jumpPressed = this.shootPressed = this.downPressed = false;
    this.down = false;
    this.v = { left: false, right: false, jump: false, shoot: false, run: false, down: false };

    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  onKey(e, down) {
    const list = ['ArrowLeft','ArrowRight','ArrowDown','KeyA','KeyD','KeyS','Space','KeyK','KeyX','ShiftLeft','ShiftRight'];
    if (!list.includes(e.code)) return;
    this.keys.set(e.code, down);
    e.preventDefault();
  }

  update() {
    const is = (c)=> this.keys.get(c) === true;
    this.left = is('ArrowLeft') || is('KeyA') || this.v.left;
    this.right = is('ArrowRight') || is('KeyD') || this.v.right;
    const jNow = is('Space') || is('KeyK') || this.v.jump;
    const jPrev = this.prevKeys.get('Space') || this.prevKeys.get('KeyK') || this.prevKeys.get('v:jump');
    this.jump = jNow; this.jumpPressed = !!jNow && !jPrev;
    const sNow = is('KeyX') || this.v.shoot;
    const sPrev = this.prevKeys.get('KeyX') || this.prevKeys.get('v:shoot');
    this.shoot = sNow; this.shootPressed = !!sNow && !sPrev;
    const dNow = is('ArrowDown') || is('KeyS') || this.v.down;
    const dPrev = this.prevKeys.get('ArrowDown') || this.prevKeys.get('KeyS') || this.prevKeys.get('v:down');
    this.down = dNow; this.downPressed = !!dNow && !dPrev;
    this.run = is('ShiftLeft') || is('ShiftRight') || is('KeyX') || this.v.run;

    this.prevKeys = new Map(this.keys);
    if (this.v.jump) this.prevKeys.set('v:jump', true); else this.prevKeys.delete('v:jump');
    if (this.v.shoot) this.prevKeys.set('v:shoot', true); else this.prevKeys.delete('v:shoot');
    if (this.v.down) this.prevKeys.set('v:down', true); else this.prevKeys.delete('v:down');
  }

  setVirtual(key, down) { if (key in this.v) this.v[key] = !!down; }
}

