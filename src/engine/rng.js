// 轻量可复现 RNG 与权重选择工具
// 用法：
//   const rng = createRNG('seed'); rng.random(); // [0,1)
//   pickWeighted([{type:'coin',weight:0.5},{type:'star',weight:0.25}], rng.random)

function hashSeed(seed){
  const s = String(seed);
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function createRNG(seed){
  let state = hashSeed(seed) || 123456789;
  return {
    random(){ // 32位LCG
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state >>> 0) / 4294967296;
    }
  };
}

export function pickWeighted(items, randFn){
  const r = typeof randFn==='function'? randFn : Math.random;
  let sum = 0; for(const it of items){ sum += (Number(it.weight)||0); }
  if (sum<=0) return (items[0]?.type)||null;
  let t = r()*sum;
  for(const it of items){ const w=(Number(it.weight)||0); if (t < w) return it.type; t -= w; }
  return (items[items.length-1]?.type)||null;
}

