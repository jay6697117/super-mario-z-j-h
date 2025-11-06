# HTML 超级玛丽（致敬版）

> 纯前端、零依赖、HTML5 Canvas 横版平台游戏。所有图形为程序绘制，避免使用官方版权素材。

## 运行
- 直接双击 `index.html`（推荐 Chrome/Edge/Firefox）。若本地模块受限，可：`python3 -m http.server 5173` 然后访问 `http://localhost:5173/`。

## 操作
- 移动：`A/D` 或 `←/→`
- 跳跃：`K` 或 `Space`
- 射击（强化后）：`X`（≈200ms 节流）
- 跑动：`Shift` 或 长按 `X`
- 进管道：`↓`（在绿色管道上）
- 暂停：`P`；重置：`R`

## 目录
- `index.html`，`styles.css`
- `src/`
  - `main.js`：主循环、状态与交互
  - `constants.js`：常量（瓦片尺寸等）
  - `engine/`：`renderer.js`、`physics.js`、`input.js`、`sfx.js`、`particles.js`
  - `entities/`：玩家/敌人/龟壳/子弹/蘑菇/金币/星星等
  - `levels/`：`level1.js`（含地下分支）、`level2.js`（含龟）、`level3.js`
- `docs/`
  - `RESEARCH.zh-CN.md`：玩法调研（SMB1 摘要）
  - `DIFF_AND_GAP.zh-CN.md`：现状对比与差异清单
  - `ROADMAP.zh-CN.md`：阶段路线图
  - `EXEC_PLAN.zh-CN.md`：短期执行计划（每次执行读取）

## 已实现
- 可变跳、跑动、AABB 碰撞；倒计时；旗杆按高度计分+剩时折算；
- 问号砖/砖块（强化可顶碎）、隐藏奖励；管道主/地下房间切换；
- 敌人与道具：Goomba、Koopa/龟壳弹射、金币、蘑菇、星星无敌、子弹；
- 粒子与合成音效；移动端触控按键。

## 下一步（见 docs/EXEC_PLAN.zh-CN.md）
- 旗杆滑落/结算动画、BGM/警报、城堡 1-4 与火条、关卡配置 JSON 化等。

