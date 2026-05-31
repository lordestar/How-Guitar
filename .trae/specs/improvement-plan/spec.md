# 「如何吉他」小程序改进方案

## Why

当前小程序仅有"和弦指法查询"和"吉他调音器"两个独立功能，功能覆盖面有限，用户用完即走，缺乏粘性。代码库中已有的**指板渲染引擎(draw.js + fretboard-viewer)**、**音频合成引擎(audioEngine.js)**、**音高检测引擎(pitch.js)**、**和弦知识库(chordExplanations.js)** 等核心能力未被充分利用。本方案旨在复用现有能力，以较低成本扩展功能，从"工具型"向"学习型"产品进化。

## What Changes

### 新功能

#### 1. 音阶模式 (Scale Mode)
- 在 chord 页面增加"和弦/音阶"切换开关
- 增加音阶类型选择：大调音阶、小调音阶（自然/和声/旋律）、五声音阶（大调/小调）、布鲁斯音阶
- 在指板上高亮显示所选音阶的所有音符位置
- 复用：draw.js 指板渲染、fretboard-viewer 组件、fretboard.js 搜索算法

#### 2. 和弦进行练习模式 (Chord Progression Practice)
- 预设常见和弦进行列表（I-IV-V, I-V-vi-IV, ii-V-I, 卡农进行等）
- 选定进行后，按顺序自动切换和弦指法，配合节拍器节奏
- 支持变速（60/80/100/120 BPM）
- 复用：chordDatabase 和弦数据、fretboard-viewer 组件、audioEngine.js 发声

#### 3. 和弦听力训练 (Ear Training)
- 游戏化猜和弦：audioEngine 播放一个和弦声音，用户从选项中选择
- 积分系统，记录连续答对次数
- 多难度级别：2选1 → 4选1 → 自由输入
- 复用：audioEngine.js 播放、chordDatabase 和弦数据

#### 4. 变调夹功能 (Capo Support)
- 在结果页增加变调夹设置滑块（0-12品）
- 启用后指法图自动平移，标注实际音高
- 复用：fretboard.js 指法搜索、draw.js 渲染

### 现有功能改进

#### 5. 指板图手指编号标注
- 在按法圆点上标注手指编号（1=食指, 2=中指, 3=无名指, 4=小指）
- 复用：draw.js 渲染逻辑

#### 6. 和弦难度评级
- 为每个指法标注难度星级（1-5星）
- 评级依据：是否横按、品数跨度、制音弦数量
- 复用：fretboard.js 评分系统扩展

#### 7. 常见和弦进行推荐入口（首页）
- 在首页增加"常见和弦进行"快速入口
- 点击后自动进入和弦进行练习模式
- 复用：chordExplanations.js 中的进行数据

## Impact

- Affected specs: 小程序核心功能从"查询+调音"扩展为"查询+调音+练习+学习"
- Affected code:
  - pages/index - 首页增加新入口
  - pages/chord - 增加音阶/练习模式选择
  - pages/result - 增加变调夹、手指编号、难度评级
  - components/fretboard-viewer - 增强渲染能力
  - utils/draw.js - 增加音阶、手指编号渲染
  - utils/fretboard.js - 增加音阶搜索、难度评分
  - 新增 pages/practice - 练习模式页面
  - 新增 pages/ear-training - 听力训练页面
