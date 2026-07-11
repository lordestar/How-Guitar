# 如何吉他 (How-Guitar) — 开发规范

> 本文档定义项目的工程化开发标准，所有 AI 代理和人类开发者应遵循。

---

## 一、项目技术栈

| 项 | 值 |
|---|---|
| 平台 | 微信小程序（原生 WXML + WXSS + JS） |
| 基础库 | >= 2.25.0 |
| JS 语法 | ES2021（严格使用 const/let，禁止 var） |
| 模块系统 | CommonJS（require / module.exports） |
| 测试框架 | Jest 30+ |
| 代码格式化 | Prettier（singleQuote、es5 trailingComma、100 printWidth） |
| 代码检查 | ESLint（eslint:recommended + prettier） |
| CI | GitHub Actions（.github/workflows/test.yml） |

---

## 二、文件目录结构

```
How-Guitar/
├── app.js / app.json / app.wxss       # 应用入口（仅全局配置，不放业务逻辑）
├── pages/                              # 页面层（WXML + WXSS + JS + JSON）
│   ├── index/                          #   只处理 UI 事件和数据绑定
│   ├── chord/
│   ├── result/
│   └── tuner/                          #   调音器主页面（仅录音管理 + UI）
├── components/                         # 可复用组件
│   └── fretboard-viewer/
├── utils/                              # 纯逻辑工具模块（不依赖 wx API 的优先）
│   ├── chordDatabase.js                #   和弦数据 + 类型定义
│   ├── chordExplanations.js            #   乐理说明数据
│   ├── fretboard.js                    #   指法搜索算法
│   ├── fretboardData.js                #   指板数据抽象层
│   ├── draw.js                         #   指板图 Canvas 渲染
│   ├── audioEngine.js                  #   音频合成引擎
│   ├── pitch.js                        #   音高检测引擎
│   ├── tuningPresets.js                #   调音预设
│   ├── tunerGauge.js                   #   调音器仪表盘渲染
│   ├── tunerStateMachine.js            #   调音状态机
│   └── constants.js                    #   全局常量集中管理
├── tests/                              # 单元测试（Jest）
│   └── *.test.js                       #   每个 utils/ 模块对应一个测试文件
├── package.json                        # npm 项目配置
├── .eslintrc.json                      # ESLint 规则
├── .prettierrc                         # Prettier 配置
├── .editorconfig                       # 编辑器配置
├── .gitignore                          # Git 忽略规则（含隐私文件）
├── .github/workflows/test.yml          # CI 流水线
└── DEVELOPMENT.md                      # 本文件
```

---

## 三、代码风格

### 3.1 变量声明

- **永远不使用 var**（ESLint: no-var: error）
- 不重新赋值的变量用 const
- 需要重新赋值的用 let
- 模块顶层变量：const（除非必须在多个函数间共享可变状态，此时用 let）

```js
// 正确
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let minFret = 999;
for (let i = 0; i < 6; i++) { ... }

// 错误
var noteNames = [...];
```

### 3.2 函数定义

- utils/ 模块：使用 function 声明（支持 hoisting，便于阅读）
- Page/App/Component 方法：保留 function 关键字（微信框架可能需要 this 绑定）
- 回调函数：优先使用箭头函数

```js
// utils/ 模块
function getNoteAtFret(stringIndex, fret) { ... }

// Page 定义
Page({
  onLoad: function () { ... },   // 保留 function
  handleTap() { ... },            // 或简写（微信支持）
})

// 回调
setTimeout(() => { ... }, 100);
```

### 3.3 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 文件名 | kebab-case | chordDatabase.js、tunerGauge.js |
| 函数名 | camelCase | getChordNotes、drawFretboard |
| 常量 | UPPER_SNAKE_CASE | SEARCH_MAX_FRET、RMS_THRESHOLD_ON |
| 模块级变量 | camelCase | openStrings、fretLineColor |
| CSS 类名 | kebab-case | .gauge-box、.step-dot |

### 3.4 模块规范

- 所有 utils/ 模块使用 module.exports 导出公开 API
- 导入时使用对象解构按需引入
- 禁止同一模块内多次 require 同一文件

```js
// 正确
const { getChordNotes, CHORD_TYPE_NAMES } = require('./chordDatabase');

// 错误：函数内部二次 require
function foo() {
  const { getChordNotes } = require('./chordDatabase'); // 不应该
}
```

---

## 四、文件编码

### 强制规则：UTF-8 without BOM

- **所有文件必须是 UTF-8 编码，不带 BOM**
- 微信小程序编译器不支持 BOM，会导致 WXSS 编译错误或 JS 解析失败
- 在 VS Code 中：底部状态栏点击编码 -> Save with Encoding -> UTF-8

**禁止使用以下 PowerShell 命令写文件（会加 BOM）：**
```powershell
Set-Content -Encoding UTF8    # 错误：Windows 上会加 BOM
Out-File -Encoding utf8       # 错误：同上
```

**安全替代方案：**
```powershell
# 方案 1：Python
python -c "open('f.js','w',encoding='utf-8').write(content)"

# 方案 2：.NET API
[System.IO.File]::WriteAllText('f.js', $content, [System.Text.UTF8Encoding]::new($false))
```

---

## 五、测试规范

### 5.1 必须写测试的场景

- utils/ 下的**所有**公开导出函数
- 核心算法（指法搜索 fretboard.js、音高检测 pitch.js）
- 数据转换函数（chordDatabase.js、tuningPresets.js）
- 纯渲染函数（draw.js、tunerGauge.js）：至少验证不抛异常

### 5.2 测试文件命名

- 文件名：tests/<moduleName>.test.js
- 每个 utils/xxx.js 对应一个 tests/xxx.test.js

### 5.3 运行测试

```bash
npm test           # 全量运行
npm run test:watch # 监听模式
```

### 5.4 覆盖目标

- utils/ 公开 API 覆盖率目标：**100%**
- 每个 describe 块至少包含正常路径、边界条件、异常输入三类用例

---

## 六、页面传参规范

**禁止使用 wx.Storage 在页面间传递非持久化数据。**

```js
// 错误：把 Storage 当消息总线
wx.setStorageSync('currentFingeringResult', result);
wx.navigateTo({ url: '/pages/result/result' });

// 正确：使用 app.globalData
getApp().globalData.fingeringResult = result;
wx.navigateTo({ url: '/pages/result/result' });
```

保留在 Storage 中的数据仅限于：
- darkMode — 用户偏好
- favoriteChords — 用户收藏
- customTunings — 用户自定义调弦
- lastTuningId — 上次使用的调弦方案

---

## 七、Git 工作流

### 7.1 分支命名

- master — 稳定分支
- codex/<feature> — AI 代理创建的功能分支

### 7.2 提交规范

```
<type>(<scope>): <简短描述>

类型： feat | fix | refactor | test | docs | chore
范围： tuner | chord | fretboard | utils | pages | ci
```

示例：
```
feat(tuner): 水平条形仪表盘 + 自动切弦开关
refactor(utils): 提取 tunerStateMachine 和 tunerGauge 模块
test(chordDatabase): 补齐和弦查询单元测试
```

### 7.3 提交前检查清单

- [ ] npm test 全量通过
- [ ] npm run lint 无错误
- [ ] 新增文件无 BOM 头
- [ ] 无 Storage 消息总线滥用
- [ ] 新增 utils/ 模块有对应测试
- [ ] **无密钥/AppSecret/token 等敏感信息**（参见第十章）

---

## 八、添加新功能的检查清单

1. **新页面**：注册到 app.json 的 pages 数组
2. **新 utils 模块**：创建 module.exports 导出，创建对应 tests/xxx.test.js
3. **新常量**：添加到 utils/constants.js（不要散落在各模块）
4. **页面间传参**：使用 app.globalData，不要用 wx.Storage
5. **编码检查**：确认文件是 UTF-8 without BOM
6. **测试验证**：npm test 零失败，零回归
7. **安全检查**：确认未引入新的密钥/AppSecret/个人路径等敏感信息

---

## 九、已知技术债务（第二期已解决，第三期待定）

- [x] var -> const/let 全面替换
- [x] BOM 头批量清除
- [x] 页面传参从 Storage -> globalData
- [x] tuner.js 拆分为 Gauge + StateMachine
- [x] 指板数据抽象层 fretboardData.js
- [ ] tuner.js 中 result.js（被 IDE 锁）的 var -> const/let 替换
- [ ] app.js 全局字段补全（被 IDE 锁）
- [ ] 音阶指板图模式
- [ ] 和弦进行练习模式

# 如何吉他 (How-Guitar) — 开发规范

> 本文档定义项目的工程化开发标准，所有 AI 代理和人类开发者应遵循。

---

## 十、隐私与安全

### 10.1 核心原则

> **一句口诀：AppID 是门牌号（公开），AppSecret 是钥匙（绝密）。**

微信小程序中，以下信息的安全等级完全不同：

| 信息 | 安全等级 | 说明 |
|------|---------|------|
| AppID | 公开 | 类似 GitHub 用户名，用户使用小程序时即可看到 |
| AppSecret | 绝密 | 配合 AppID 可调用微信服务端 API、获取用户数据 |
| 用户 OpenID | 敏感 | 不应明文存储在前端代码或日志中 |
| 个人邮箱/手机号 | 敏感 | 不应出现在代码注释或变量名中 |
| 本地文件绝对路径 | 注意 | 可能暴露用户名（如 C:\\Users\\张三\\...） |

### 10.2 绝对禁止提交到仓库的文件与内容

以下内容**任何时候都不能**出现在 Git 仓库中：

- AppSecret、access_token、session_key
- .env / .env.* 文件（环境变量）
- *.pem / *.key 文件（私钥证书）
- 任何包含真实手机号、身份证号、家庭住址的代码或注释
- 包含个人用户名的本地绝对路径（如 C:\\Users\\张三\\）

**如果已提交过上述内容**，仅删除文件是不够的 — Git 历史中仍可追溯。应立即：
1. 在微信开放平台**重置 AppSecret**（一键操作，立即生效）
2. 使用 git filter-branch 或 GitHub 官方工具清理历史
3. Force push 覆盖远程仓库

### 10.3 .gitignore 规则

本项目 .gitignore 已配置以下防护：

`gitignore
# === 隐私与安全 ===
# 环境变量 & 密钥文件
.env
.env.*
*.pem
*.key

# IDE 配置（可能含个人路径）
.vscode/
.idea/
*.swp
*.swo
*~

# 小程序私有配置（可能含个人 AppID）
project.private.config.json
`

### 10.4 project.config.json 中的 AppID

- project.config.json 中的 appid 字段可以保留占位值，开发者自行替换
- project.private.config.json 已被 .gitignore 排除，它通常由微信开发者工具自动生成并包含真实的个人 AppID

### 10.5 提交前自查

每次 git commit 前，快速确认：

1. git diff --staged 中是否出现 AppSecret、secret、token 字样
2. 是否有 .env、.pem、.key 文件被意外 git add
3. 新增的代码注释中是否包含个人邮箱或手机号
4. 是否有硬编码的本地绝对路径

### 10.6 如果密钥已经泄露

1. **立即重置**：登录微信公众平台 → 开发 → 开发管理 → 开发设置 → 重置 AppSecret
2. **清理历史**：GitHub 上有专门的敏感数据清除指南
3. **评估影响**：确认泄露时间段内是否有异常 API 调用（微信后台可查看调用统计）

> AppSecret 重置是瞬间生效的，旧密钥立即失效，不需要重新提审或发布小程序。

---

*文档版本: v1.1 | 最后更新: 2026-07-09*
