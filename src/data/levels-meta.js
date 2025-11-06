// 世界&关卡参数（模块化配置）
export const WORLD_MAP = ['1-1','1-2','1-3','1-4','2-1','2-2','2-3','2-4'];
export const LEVELS_META = {
  '1-1': { timeLimit: 300, lowTimeThreshold: 100, alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '1-2': { timeLimit: 300, lowTimeThreshold: 100, alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '1-3': { timeLimit: 400, lowTimeThreshold: 90,  alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '1-4': { timeLimit: 300, lowTimeThreshold: 80,  alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  // 2‑x 先复用 1‑x 的默认参数，可在编辑器里覆盖
  '2-1': { timeLimit: 300, lowTimeThreshold: 100, alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '2-2': { timeLimit: 300, lowTimeThreshold: 100, alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '2-3': { timeLimit: 400, lowTimeThreshold: 90,  alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
  '2-4': { timeLimit: 300, lowTimeThreshold: 80,  alertLastSeconds: 10, timeBonusPerSecond: 5, flagBonus: [100,400,800,2000,5000] },
};

export function getLevelId(index){ return WORLD_MAP[index] || WORLD_MAP[0]; }
export function getLevelMeta(index){ return LEVELS_META[getLevelId(index)]; }
