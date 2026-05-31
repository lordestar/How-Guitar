# 调音切换卡顿修复方案

## 问题描述

在调音器页面切换调音方式（如从"标准调弦"切换到"DADGAD"）后，调音器界面卡住，需要退出到首页再重新进入才能继续调音。

## 根因分析

`resetTuning()` 函数中调用了 `stopRec()` 再调 `startRec()`，导致录音引擎状态冲突：

1. `wx.getRecorderManager()` 在微信小程序中返回的是**单例对象**
2. `stopRec()` 调用 `this.recMgr.stop()` —— 这是一个异步操作，停止需要时间
3. 紧接着 `startRec()` 再次通过 `wx.getRecorderManager()` 获取同一个单例 → 设置事件处理器 → 调用 `.start()`
4. 此时旧的 `.stop()` 还未完成，新的 `.start()` 在冲突状态下可能静默失败
5. `recMgr.onStart` 回调不触发 → `this.isRunning` 保持 `false` → `onFrameRecorded` 中 `if (!self.isRunning) return;` 丢弃所有音频帧 → 调音器卡死

## 修复方案

**核心思路：切换调音时不需要停止/重启录音，只需更新目标频率引用的数据即可。**

当前代码中，`onFrameRecorded` 回调是通过闭包引用 `self.currentTuningStrings` 的：
```
var targetTunings = self.currentTuningStrings || self.data.tuningOrder;
var result = pitch.detectPitch(merged, self.SAMPLE_RATE, targetTunings);
```

所以只需要修改 `self.currentTuningStrings = strings`，录音引擎会自动使用新调音的目标频率。

## 修改步骤

### 1. 修改 `resetTuning()` 函数

**修改前：**
```
resetTuning: function (strings) {
    this.stopRec();          // ← 问题：停止录音
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];
    this.drawAngle = 0;
    this._currentAngle = 0;
    this.smoothAngle = null;
    this.currentTuningStrings = strings;
    this.setData({ ... });   // 更新 UI
    this.startRec();         // ← 问题：重启录音
},
```

**修改后：**
```
resetTuning: function (strings) {
    // 不停止/重启录音，只重置状态数据和目标频率引用
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];
    this.drawAngle = 0;
    this._currentAngle = 0;
    this.smoothAngle = null;
    this.currentTuningStrings = strings;
    this.setData({ ... });   // 更新 UI
},
```

### 2. 移除 `switchTuning` 中对 `resetTuning` 中的录音启停依赖

只需确认 `switchTuning` → `resetTuning` 流程不再涉及录音启停，所有状态重置都在 UI 数据层面完成。

### 3. （可选）添加安全防护

在 `resetTuning` 开始时，如果 `isRunning` 为 `false`（理论上不会发生，但作为防护），则回退到 `startRec()`：
```
if (!this.isRunning) {
    this.startRec();
}
```

## 影响范围

只修改 `pages/tuner/tuner.js` 这一个文件中的 `resetTuning` 方法。

不涉及：
- 不修改录音启停逻辑 `startRec()` / `stopRec()`
- 不修改音高检测 `pitch.js`
- 不修改 UI 面板
- 不修改自定义调弦页面

## 验证标准

1. 在标准调弦下调完第 6、5 弦后，切换到 DADGAD
2. 调音器立即重置：进度条显示 D A D G A D，状态变为"请拨动第6弦"
3. 拨动第 6 弦（D2=73.42Hz），指针正常摆动，偏差判定正常
4. 切换到其他调音（如 Open G），同样正常工作
5. 打开自定义调弦页面创建一个新调音并保存，返回后自动选中并使用
6. 退出调音器再进入，恢复上次使用的调音，正常调音
