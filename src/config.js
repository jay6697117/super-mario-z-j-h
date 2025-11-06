// 全局游戏配置，可被关卡覆盖
export const GAME_CONFIG = {
  timeBonusPerSecond: 5,     // 剩余时间换分倍率
  lowTimeThreshold: 100,     // 低时限阈值，加速BGM
  alertLastSeconds: 10,      // 最后N秒每秒蜂鸣
  flagSlideSpeed: 220,       // 滑旗向下速度（像素/秒）
  // 结算面板（数码管）
  settleDigitsScore: 6,      // 分数显示位数
  settleDigitsTime: 3,       // 时间显示位数
  settleSegSize: 22,         // 七段数码管单字尺寸（像素）
  settleSegThick: 4,         // 七段线条粗细
  settleDrainPerSec: 60,     // 结算阶段每秒减少的时间（秒/秒）
  fireworkScore: 500,        // 每朵烟花加分
};
