// 全局游戏配置，可被关卡覆盖
export const GAME_CONFIG = {
  timeBonusPerSecond: 5,     // 剩余时间换分倍率
  lowTimeThreshold: 100,     // 低时限阈值，加速BGM
  alertLastSeconds: 10,      // 最后N秒每秒蜂鸣
  flagSlideSpeed: 220,       // 滑旗向下速度（像素/秒）
  // 多金币砖（M）默认参数
  multiCoinDefault: { count: 10, windowSec: 6 },
  // 生命与 Continue
  livesEnabled: true,
  initialLives: 3,
  // 结算面板（数码管）
  settleDigitsScore: 6,      // 分数显示位数
  settleDigitsTime: 3,       // 时间显示位数
  settleSegSize: 22,         // 七段数码管单字尺寸（像素）
  settleSegThick: 4,         // 七段线条粗细
  settleDrainPerSec: 60,     // 结算阶段每秒减少的时间（秒/秒）
  fireworkScore: 500,        // 每朵烟花加分
  // 流式生成/离屏回收参数（里程碑A）
  stream: {
    activateMargin: 320,     // 激活带：相机左右各 N 像素
    despawnLeft: 480,        // 左侧回收阈值：相机左边再退 N 像素
    despawnRight: 640        // 右侧回收阈值（一般可略大，避免闪烁）
  },
  // RNG（里程碑B占位）：存在时用于确定性掉落
  rngSeed: null,
  // 掉落权重表（用于问号砖等）
  drops: {
    question: [
      { type: 'coin',     weight: 0.50 },
      { type: 'star',     weight: 0.25 },
      { type: 'mushroom', weight: 0.25 }
    ]
  },
};
