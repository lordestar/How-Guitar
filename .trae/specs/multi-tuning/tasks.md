# Tasks

## 阶段一：数据层 — 调音预设模块

- [x] Task 1: 创建 `utils/tuningPresets.js`，定义所有内置调音预设数据和弦安全范围
  - 定义所有预设调音（Standard、Drop D、DADGAD、Open D、Open G、Half Step Down、Full Step Down）
  - 每个预设包含：id、name（中文名）、strings（6根弦的 {string, note, frequency}）
  - 定义弦音安全范围常量 `STRING_SAFE_RANGE`（每根弦的最低/最高半音值）
  - 导出校验函数 `isNoteInSafeRange(stringIndex, semitone)`，验证某弦的某个音是否安全
  - 导出 `getTuningById(id)` 和 `getAllPresets()` 函数
  - 验证：`getTuningById('dadgad')` 返回正确的 DADGAD 数据

- [x] Task 2: 重构 `utils/pitch.js`，解耦硬编码的标准调弦
  - 导入 `tuningPresets.js` 的预设
  - 移除顶部的 `STANDARD_TUNING` 硬编码常量
  - 修改 `detectPitch` 的谐波校正逻辑（第159-182行），使其接受 `targetTuning` 参数而非硬编码引用 `STANDARD_TUNING`
  - 保持向后兼容：导出 `STANDARD_TUNING` 作为 `getTuningById('standard')`
  - 验证：`require('../../utils/pitch').STANDARD_TUNING` 仍然可用且值不变

## 阶段二：UI层 — 调音方式选择面板

- [x] Task 3: 修改调音器页面布局，增加调音切换入口和底部面板
  - `tuner.wxml`：
    - 在右下角增加悬浮按钮（⚙️ 图标），位置固定在右下角
    - 增加底部选择面板（Bottom Sheet）：半透明遮罩 + 从底部滑出的面板
    - 面板内容：标题"选择调音方式" + 预设列表 + 分割线 + "+ 自定义"按钮
    - 面板用 `wx:if` 控制显示/隐藏，用 CSS transition 实现滑入动画
  - `tuner.wxss`：
    - 右下角悬浮按钮样式（60rpx 圆形，半透明背景，置于底层 z-index）
    - 底部面板样式（圆角顶部、深色背景 `#1E1E3A`、最大高度 70vh 可滚动）
    - 列表项样式（左右布局：调音名称 + 调音描述，右箭头指示）
    - 选中项高亮标记（绿色对勾或高亮背景）
  - 验证：调音器页面右下角可见齿轮按钮，点击后底部面板平滑滑出

- [x] Task 4: 实现调音切换逻辑（tuner.js）
  - 增加数据属性：`showTuningPanel`（控制面板显隐）、`currentTuningId`（当前调音ID）、`tuningList`（调音列表，包含预设+自定义）
  - 增加方法：`onToggleTuningPanel()` 切换面板显隐、`onSelectTuning(e)` 选择调音、`onAddCustom()` 打开自定义页面
  - 选择调音后：更新 `currentTuningId`、更新 `tuningOrder`、调用 `resetState(0)`、关闭面板、更新 `currentInfo` 文案
  - `onLoad` 时从 `wx.getStorageSync('lastTuning')` 读取上次调音，无则默认标准
  - 切换调音时将当前调音 ID 写入 `wx.setStorageSync('lastTuning')`
  - 完成弹窗文案跟随当前调音名称（如"标准调音全部调准！"）
  - 验证：选择 DADGAD 后，进度条显示 D A D G A D，调音器各弦目标频率切换为 DADGAD

## 阶段三：功能层 — 自定义调弦

- [x] Task 5: 创建自定义调弦页面
  - 新建目录 `pages/tuner/custom-tuning/`，创建 4 个文件（js/json/wxml/wxss）
  - 在 `app.json` 的 `pages` 中注册 `pages/tuner/custom-tuning/custom-tuning`
  - 页面功能：
    - 顶部标题 + 调音名称输入框（placeholder: "命名你的调弦方案"）
    - 6根弦分别展示：弦编号、当前音名、频率，每个带一个滑动选择器（picker 或 slider）
    - 每根弦的选择范围限制在安全范围内（从 `tuningPresets.js` 的 `STRING_SAFE_RANGE` 读取）
    - 实时显示当前音名和频率
    - 如果超出安全范围，显示红色警告
    - 保存按钮：校验 → 写入本地存储 → 返回调音器页并选中刚创建的调音
    - 取消按钮：返回调音器页
  - 验证：进入自定义页面，每根弦可独立选择音高，选择超出范围的音时出现警告

- [x] Task 6: 实现自定义调弦的持久化和删除
  - 自定义调弦存入 `wx.setStorageSync('customTunings', [...])`，格式与预设调音一致加 `isCustom: true`
  - 调音选择面板加载时合并预设列表 + 自定义列表，自定义排在预设之后
  - 自定义调音项右侧显示删除按钮（🗑️ 图标）
  - 点击删除时弹出确认弹窗，确认后从本地存储移除并刷新列表
  - 验证：创建自定义调音 → 返回列表可见 → 删除 → 列表中消失

- [x] Task 7: 谐波校正逻辑适配多调音
  - 修改 `pitch.js` 的 `detectPitch` 函数，增加可选参数 `targetTunings`（当前调音的6个目标频率）
  - 当 `targetTunings` 传入时，谐波校正使用传入的目标频率列表进行匹配
  - 修正逻辑：优先匹配当前调音的目标频率，其次尝试谐波降倍频
  - 在 `tuner.js` 调用 `detectPitch` 时传入 `tuningOrder` 的 `frequency` 数组
  - 验证：DADGAD 下调 A 弦（220Hz），谐波校正不会错误地修正到标准 B 弦（246.94Hz）

# Task Dependencies

- Task 1 (预设数据) 无依赖，可最先完成
- Task 2 (重构 pitch.js) 依赖 Task 1
- Task 3 (UI面板) 无依赖，可并行于 Task 1
- Task 4 (切换逻辑) 依赖 Task 1 + Task 3
- Task 5 (自定义页面) 依赖 Task 1
- Task 6 (持久化) 依赖 Task 5
- Task 7 (谐波校正) 依赖 Task 1 + Task 2

并行计划：
- 第一波：Task 1 + Task 3 可并行
- 第二波：Task 2 + Task 5 可并行（均依赖 Task 1）
- 第三波：Task 4 + Task 6 可并行（Task 4 依赖 Task 1+3，Task 6 依赖 Task 5）
- 第四波：Task 7（依赖 Task 1+2）
