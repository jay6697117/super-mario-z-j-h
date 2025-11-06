# 执行计划（短期，每次执行读取）

本计划文件给出下一个开发周期的具体任务列表，遵循“先计划再执行”。建议每次执行前更新本文件，再据此落地实现。

## 当前周期目标（已完成/在做）
- 已完成 A：
  - 数码管结算面板（剩时逐步换分 + 旗高奖励）。
  - BGM 低时限模式 + HUD 脉冲警示。
  - 角色起跑/急停/受击姿态 + 火花细节。
- 已完成 B：
  - 水下控制与敌人（Cheep Cheep、Blooper），1‑3 改为水下关。
  - 城堡桥 + 斧头收尾动画（1‑4 终点桥坍塌→结算）。
- C（进行中）：
  - 炮台 + Bullet Bill、Hammer Bro（已落地）。
  - Lakitu/Spiny、Piranha 细规则（玩家管口附近不出现）（下一步）。
- D（进行中）：
  - 关卡/实体参数模块化（时间、阈值、奖励倍率）与世界结构（1‑x~8‑x）映射（下一步）。
- E（预备）：
  - 轻量关卡编辑器、碰撞/计分单元测试、渲染快照（下一阶段）。

## 下一个迭代目标（本周期执行）
1. C：实现 Lakitu/Spiny（含生成/投掷），完善 Piranha 近管口不出现逻辑（已接入状态机 + 近距阻塞）；Lakitu 投掷节奏随机 + 同屏 Spiny 上限（默认 3）与投掷范围限制（已接入）；关卡植入与渲染。
2. D：关卡/实体参数模块化（以 JS 模块形式导出配置），覆盖每关时间、低时限阈值、旗奖励倍率；主循环读取并覆盖关卡参数（已接入时间/低时限/旗奖励）；完善世界结构映射与 HUD 文案来源（已接入）。
   - 实体参数扩展（已接入）：Lakitu（dropCd/maxSpinyActive/rangeTiles），Piranha（upTime/downTime/holdUp/holdDown/nearTilesX/nearYOffset）；编辑器支持读写以上参数并导入导出。
   - 新增：每关 alertLastSeconds 与 timeBonusPerSecond（已接入）。
   - 本地存档：当前关卡索引与中途旗位置（localStorage，已接入）。
3. 小型稳定性打磨：
   - 摄像机平滑与边缘缓冲（已接入）：cameraFollow 输出目标位，updateCamera 基于 dt LERP 缓动，世界边界 clamp，减少抖动与突跳；
   - 实体渲染早退（已接入）：在 Renderer.drawEntity 做可见性裁剪（完全离屏不绘制），降低复杂场景下渲染成本；
   - 子弹/壳对新敌人的交互覆盖；水下与地上行为边界验证；通关后清理下一关 checkpoint。
   - 编辑器预设（已接入）：地面/地下/水下/城堡一键设置主题与时间阈值。
4. 新增内容（本周期一次性落地）：
   - 移动平台（已接入）：水平/垂直往返，承载玩家（从上方落下站稳，随平台移动）；编辑器参数（range/speed/w/h）。
   - 火焰喷口（已接入）：周期喷火（up/down/left/right），接触受伤/死亡；编辑器参数（dir/length/period/on）。
   - Warp Zone（已接入）：矩形触发器，按下进入目标关卡；编辑器参数（to/w/h）。
   - 生命与 Continue（已接入）：默认开启，初始 3 条；死亡扣命，归零进入 GAME OVER，按 R 继续从当前关卡（可关闭 livesEnabled 获得 ∞）。
5. E：轻量关卡编辑器（已接入，E 键开启/关闭，支持地块与刷怪放置、导出/导入 JSON；刷怪参数可编辑：cannon(dir/period/range/maxActive)、firebar(segments/speed)、lakitu(dropCd)、cheep(dir)、hammer-bro(jumpCd/throwCd)、platform(range/speed/size)、warp(to/size)、flame(dir/length/period/on)），渲染快照（O 键下载当前画面），最小测试入口（控制台 runTests）。

## 验收标准
- Lakitu/Spiny 行为稳定：Lakitu 会在玩家上方飘移并周期抛出 Spiny；Spiny 地面巡逻且不可踩。
- Piranha 在玩家靠近管口时不露头；远离后正常起伏。
- 每关时间/低时限阈值/旗奖励在配置中可控，HUD 关卡名来自世界结构映射；通关结算逻辑与配置一致。
- 炮台、Bill、Hammer Bro 与子弹/壳交互覆盖完整，60fps 下稳定。
- 摄像机：水平方向速度变化无突跳，垂直切换平滑；切关/子房间切换后 300ms 内稳定落位；世界边缘无黑边抖动。
- 性能：相同实体数量下，渲染平均耗时下降，长帧减少（可用 DevTools 对比 Before/After）。
- 测试：控制台 `runTests()` 通过包含 Lakitu/Piranha/子弹/壳/踩踏边界、1‑3 时限元数据校验与“渲染快照（关键像素对比）”；新增移动平台落地判定。

## 备注
- 保持零外部依赖；音频以 WebAudio 合成为主；
- 若遇到移动端性能问题，优先降级粒子数量与渲染分辨率；
- 参数“JSON 化”采用“JS 模块导出配置”方案，便于浏览器直接 import。
