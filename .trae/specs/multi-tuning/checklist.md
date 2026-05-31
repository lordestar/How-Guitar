# 多调音方式支持检查清单

## 数据层

- [x] Task 1: `utils/tuningPresets.js` 创建完成
  - [x] 7 个预设调音数据完整（Standard、Drop D、DADGAD、Open D、Open G、Half Step Down、Full Step Down）
  - [x] 每根弦的安全范围定义正确
  - [x] `isNoteInSafeRange(index, semitone)` 函数正常验证自定义音高
  - [x] `getTuningById(id)` 返回正确的调音数据
  - [x] `getAllPresets()` 返回全部预设列表

- [x] Task 2: `utils/pitch.js` 重构完成
  - [x] 不再硬编码 `STANDARD_TUNING`
  - [x] `STANDARD_TUNING` 导出为调音预设的引用，保持兼容
  - [x] `detectPitch` 接受可选的 `targetTunings` 参数
  - [x] 谐波校正逻辑使用传入的目标频率而非硬编码标准调弦

## UI 层

- [x] Task 3: 调音方式选择面板
  - [x] 右下角调音切换按钮可见（⚙️ 固定右下角）
  - [x] 点击按钮从底部滑出选择面板（CSS transition 动画）
  - [x] 面板展示所有预设调音 + 自定义调音
  - [x] 当前选中的调音有视觉高亮（绿色边框 + 绿色对勾）
  - [x] 面板底部有 "+ 自定义" 按钮
  - [x] 暗色模式下面板显示正常（使用 `#1E1E3A` 背景，与调音器主题一致）
  - [x] 面板可平滑关闭（点击遮罩或关闭按钮）

- [x] Task 4: 调音切换逻辑
  - [x] 选择预设调音后面板关闭，调音器重置
  - [x] 6 根弦的目标频率/音名切换正确
  - [x] 进度条显示当前调音的弦名
  - [x] 仪表盘显示当前调音的频率
  - [x] 状态标签文案显示正确弦编号
  - [x] 调音器正常运作（拨弦检测正常）
  - [x] 切换调音后重新开始调音流程
  - [x] 完成弹窗文案包含调音名称
  - [x] 上次使用的调音被持久化保存（`wx.setStorageSync('lastTuningId')`）
  - [x] 再次进入调音器使用上次的调音

## 自定义调弦

- [x] Task 5: 自定义调弦页面
  - [x] 新建页面可正常打开（注册在 `app.json`）
  - [x] 调音名称输入框可输入文字
  - [x] 6 根弦各有音高滑动选择器（slider 组件）
  - [x] 选择器范围限制在安全范围内（从 `STRING_SAFE_RANGE` 读取）
  - [x] 实时显示音名和频率
  - [x] 超出安全范围时显示红色警告
  - [x] 保存按钮在校验通过后可点击
  - [x] 保存成功后返回调音器并选中
  - [x] 取消按钮正确返回

- [x] Task 6: 持久化和删除
  - [x] 自定义调弦保存到本地存储 `wx.setStorageSync('customTunings')`
  - [x] 调音列表中显示自定义调弦（`isCustom: true` 标记）
  - [x] 自定义调弦可删除（🗑️ 按钮）
  - [x] 删除前有确认弹窗
  - [x] 删除后列表刷新

## 核心检测引擎兼容

- [x] Task 7: 谐波校正适配
  - [x] 标准调弦下谐波校正正常工作（默认回退行为）
  - [x] DADGAD 下调 A 弦不错误修正到 B（使用目标频率列表）
  - [x] Drop D 下调低音弦不错误修正（使用目标频率列表）
  - [x] 自定义调弦下谐波校正正常工作（传入 customTuning.strings 的 frequency）
