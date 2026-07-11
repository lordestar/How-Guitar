# 🎸 如何吉他

> 一个微信小程序 —— 吉他爱好者的随身工具：和弦查询、指板可视化、和弦试听、实时调音

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.9-blue" alt="version">
  <img src="https://img.shields.io/badge/platform-wechat--miniprogram-green" alt="platform">
  <img src="https://img.shields.io/badge/tests-Jest-orange" alt="tests">
  <img src="https://img.shields.io/badge/license-private-red" alt="license">
</p>

---

## ✨ 功能特色

| 功能 | 说明 |
|------|------|
| **🎵 和弦查询** | 12 个根音 × 20 种和弦类型，覆盖大三/小三/属七/大七/小七/小九/属九/大九/减三/增三/挂二/挂四/半减七/大六/小六/加九/属七挂四/属十一/属十三 |
| **🖐️ 指板可视化** | Canvas 2D 渲染高 DPR 指板图，支持左右滑动切换多指法、一品一音标注 |
| **🔊 和弦试听** | Karplus-Strong 物理建模合成真实吉他拨弦音，多弦同时发声叠加，无需任何音频文件 |
| **📖 和弦说明** | 每个和弦的角色、听感、调性关系、经典进行（251/卡农等）、代表歌曲，乐理知识一应俱全 |
| **♥️ 收藏夹** | 收藏常用和弦，首页快速跳转，本地持久化存储 |
| **🎛️ 吉他调音器** | 自相关 + 抛物线插值音高检测引擎，弧形仪表盘实时反馈，7 种调弦预设 + 自定义调弦 |
| **🔧 自定义调弦** | 滑动调节每根弦的目标音高，安全范围约束防断弦，支持保存自定义方案 |
| **🌙 暗色模式** | 暖木色浅色主题 + 深色专业主题，一键切换，护眼舒适 |
| **💾 保存图片** | 指板图一键保存到系统相册，方便分享或打印 |

---

## 📱 页面导览

```
首页 ──┬── 🎵 和弦指法查询 ── 选择根音 ── 选择和弦类型 ── 查看指板图
       │                                           ├── 🔊 试听和弦发声
       │                                           ├── ♥️  收藏/取消收藏
       │                                           └── 💾 保存指板图
       │
       └── 🎛️ 吉他调音器 ── 选择调弦方案 ── 逐弦拨动 ── 仪表盘实时反馈
                         ├── 7 种预设（标准/Drop D/DADGAD/Open D/Open G/半音降/全音降）
                         ├── 自定义调弦（滑块调节 + 安全范围提示）
                         ├── 自动切弦 / 手动模式切换
                         └── 全部调准弹窗祝贺
```

---

## 🛠️ 技术架构

### 核心技术栈

| 领域 | 技术方案 |
|------|----------|
| **平台** | 微信小程序原生（WXML + WXSS + JavaScript ES2021） |
| **模块** | CommonJS（`require` / `module.exports`） |
| **图形** | Canvas 2D API（指板图 + 仪表盘双 Canvas） |
| **音频合成** | Karplus-Strong 算法（物理建模吉他拨弦音色） |
| **音高检测** | 自相关（Autocorrelation）+ 抛物线插值 + 谐波校正 |
| **状态管理** | 有限状态机（调音器）+ 中位数滤波 + EMA 指数平滑 |
| **主题** | CSS 自定义变量（`--page-bg` / `--accent` 等 40+ 变量） |
| **测试** | Jest 30+，覆盖 `utils/` 全部核心模块 |
| **代码规范** | ESLint + Prettier（singleQuote / 100 printWidth） |
| **性能** | 按需注入（`lazyCodeLoading`）+ 用时注入占位组件 |

### 核心算法

```
指法搜索：数据库优先 → 回溯穷举补全 → 把位聚类去重 → 多样性评分
音高检测：录音帧缓冲 → 自相关扫描（谷底→峰值）→ 抛物线插值 → 谐波校正
调音滤波：7 帧滑动中位数 → EMA 指数平滑（α=0.30）→ 10 帧连续判定
音色合成：Karplus-Strong 延迟线 → 低通衰减 → 多弦叠加 → 包络整形
```

---

## 📁 项目结构

```
How-Guitar/
├── app.js / app.json / app.wxss       # 应用入口 · 全局配置 · 全局样式（40+ 主题变量）
├── pages/
│   ├── index/                          # 首页：双入口卡片 + 收藏夹 + 暗色模式切换
│   ├── chord/                          # 和弦查询页：根音选择 → 类型选择 → 组成音预览
│   ├── result/                         # 结果页：指板图 + 和弦说明 + 试听 + 收藏 + 保存
│   └── tuner/
│       ├── tuner.*                     # 调音器主页：音频采集 + 音高检测 + 仪表盘 + 调弦面板
│       └── custom-tuning/              # 自定义调弦页：滑块调节 + 安全范围约束
├── components/
│   ├── fretboard-viewer/               # 指板图 Canvas 自定义组件（多指法滑动）
│   └── placeholder/                    # 用时注入占位组件
├── utils/                              # 纯逻辑工具层（不依赖 wx API 优先）
│   ├── chordDatabase.js                # 和弦指法数据库 + 20 种和弦类型 + 组成音计算
│   ├── chordExplanations.js            # 和弦乐理说明（角色/听感/调性/进行/歌曲）
│   ├── fretboard.js                    # 指法搜索算法（回溯 + 把位聚类 + 多样性评分）
│   ├── fretboardData.js                # 指板数据抽象层
│   ├── draw.js                         # Canvas 指板图渲染引擎（高 DPR 适配）
│   ├── audioEngine.js                  # Karplus-Strong 吉他音色合成引擎
│   ├── pitch.js                        # 自相关音高检测 + 抛物线插值 + 谐波校正
│   ├── tuningPresets.js                # 7 种调弦预设 + 安全范围约束 + 自定义存储
│   ├── tunerStateMachine.js            # 调音状态机（中位数滤波 + 稳定判定 + 自动切弦）
│   ├── tunerGauge.js                   # 弧形仪表盘 Canvas 绘制（渐变弧 + 金色指针）
│   └── constants.js                    # 全局常量集中管理
├── tests/                              # Jest 单元测试（audioEngine / chordDatabase /
│                                       #   chordExplanations / draw / fretboard / pitch /
│                                       #   tuningPresets）
├── package.json                        # npm 项目配置（scripts: lint / format / test）
├── CHANGELOG.md                        # 版本变更日志
└── DEVELOPMENT.md                      # 开发规范与工程化标准
```

---

## 🚀 本地开发

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js >= 16
- 微信小程序 AppID（在 [mp.weixin.qq.com](https://mp.weixin.qq.com) 注册）

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/lordestar/How-Guitar.git
cd How-Guitar

# 2. 安装依赖
npm install

# 3. 用微信开发者工具导入项目，选择 How-Guitar 目录
# 4. 在 project.config.json 中填入你的 AppID
# 5. 点击编译预览

# 运行测试
npm test
```

---

## 📄 版本

当前版本 **v1.0.9**（详见 [CHANGELOG.md](./CHANGELOG.md)）

| 版本 | 日期 | 亮点 |
|------|------|------|
| v1.0.9 | 2026-07 | 多调弦方案支持 + 自定义调弦 + 调音器引擎重构 |
| v1.0.5 | 2026-05 | 吉他调音器稳定版 + 首页双入口重构 |
| v1.0.0 | 2026 | 初始发布：和弦查询 + 指板图 + 试听 + 收藏 + 暗色模式 |

---

## 📝 开发规范

项目遵循严格的工程化规范，详见 [DEVELOPMENT.md](./DEVELOPMENT.md)：

- **JS 语法**：严格 `const` / `let`，禁止 `var`
- **模块系统**：CommonJS
- **代码格式化**：Prettier（singleQuote / es5 trailingComma / 100 printWidth）
- **代码检查**：ESLint（`eslint:recommended` + prettier）
- **UI 层**：不写业务逻辑，只处理事件绑定和数据渲染
- **Utils 层**：纯函数优先，不依赖 `wx` API，方便单元测试

---

## ⚠️ 注意事项

- 调音器在模拟器中无法测试（无麦克风），**需真机调试**
- 需授权麦克风权限（`scope.record`），音频仅在本地分析，不上传服务器
- 微信基础库要求 >= 2.25.0
- 极高环境噪声下可能影响音高检测精度，建议在相对安静的环境调音
