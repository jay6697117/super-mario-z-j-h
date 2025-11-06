# 超级玛丽（以 SMB1 为主）的玩法调研（摘要）

本文基于公开资料（以 MarioWiki 为主）梳理 SMB1 的核心机制与关卡元素，供项目设计与实现参考。避免版权素材，本文件仅总结机制与规则的要点。

来源（示例）：
- https://www.mariowiki.com/Super_Mario_Bros.
- https://www.mariowiki.com/Question_Block
- https://www.mariowiki.com/Brick_Block
- https://www.mariowiki.com/Hidden_Block
- https://www.mariowiki.com/Super_Mushroom
- https://www.mariowiki.com/Fire_Flower
- https://www.mariowiki.com/Starman
- https://www.mariowiki.com/Flagpole
- https://www.mariowiki.com/Warp_Zone
- https://www.mariowiki.com/Koopa_Troopa, https://www.mariowiki.com/Goomba, https://www.mariowiki.com/Bullet_Bill, https://www.mariowiki.com/Fire_Bar

## 1. 基础循环与通关
- 横版平台跳跃：按住“跑”移动更快，跳跃高度随按键时长变化（可变跳）。
- 计时与得分：每关有倒计时；击敌、吃金币/道具、破砖、通关获得分数；旗杆根据触碰高度加分，剩余时间可按比例换分。
- 生命与强化：碰敌/陷阱会掉命；强身状态（吃蘑菇）被击中会掉级而非直接死亡；火花花（Fire Flower）可发射火球；星星无敌短暂无敌。

## 2. 方块与场景元素
- 砖块（Brick Block）：可被强化状态顶碎；可能含有隐藏道具（部分版本）。
- 问号砖（Question Block）：可顶出金币、强化（蘑菇/火花花）、1UP、星星等；被取用后变成“已用”的方块。
- 隐藏砖（Hidden Block）：普通外观不可见，顶到才显形，常用于隐藏 1UP 或通路。
- 管道（Pipes）：可作为地形或入口/出口；部分管道能进入（按下），通往地下/隐藏区域；也可能喷出食人花（Piranha Plant）。
- 旗杆（Flagpole）：触杆高度决定加分，触发通关；经常连接到城堡门动画。
- 传送/隐藏区（Warp Zone）：某些区域允许跳世界或捷径；常以特殊布局或管道组合出现。
- 移动平台/升降台/藤蔓/电梯、火条（Fire Bar）、火球喷口、桥与斧头等（城堡）、水下气泡等（延展玩法）。

## 3. 敌人与互动（选摘）
- 核心敌人：Goomba（栗宝宝）、Koopa Troopa（库巴龟，踩后变龟壳可滑动）、Piranha Plant（食人花）、Cheep Cheep（飞鱼/水下鱼）、Blooper（乌贼）、Lakitu（云中哥投仔）、Hammer Bro（铁锤兄弟）、Bullet Bill（炮弹兵）、Bowser（库巴）。
- 交互模式：踩踏击败（部分敌人）；火球击败；龟壳弹射造成连击；无敌状态碰触直杀。
- 危险地形：尖刺/火条/岩浆/深坑/挤压等。

## 4. 关卡结构（SMB1 风格）
- 世界与子关：8×4 结构是典型（1-1~1-4…8-4），每世界第4关为城堡主题；还包括水下/地下主题。
- 跑动节奏：多数关卡鼓励“保持前进”，在掌握惯性与节奏后更流畅。
- 关卡中常包含隐藏奖励、分支与捷径。

## 5. 设计原则（从玩法中抽象）
- 可预期的规则 + 难度由组合堆叠形成；
- 通过地形（平台间距/高度/敌人布置）引导动作学习；
- 奖励（金币/强化/1UP）伴随风险与探索激励；
- 反馈充足：音效、粒子、动画、计分、时间音效等；
- 关卡变体：地面/地下/水下/城堡，强调节奏对比。

