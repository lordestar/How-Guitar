# 🎸 如何吉他

> 一个微信小程序 —— 选择和弦，查看吉他指板按法位置，聆听和弦发声

## ✨ 功能特色

| 功能 | 说明 |
|------|------|
| **🎵 和弦查询** | 12 个根音 × 18 种和弦类型，覆盖常用大三/小三/属七/大七/减三/增三/挂留等 |
| **🖐️ 指板图** | Canvas 渲染高颜值指板图，支持左右滑动、多指法切换 |
| **🔊 和弦试听** | Karplus-Strong 算法合成真实吉他拨弦音，无需音频文件 |
| **📖 和弦说明** | 每个和弦的角色、听感、调性关系、251 进行、代表歌曲 |
| **♥ 收藏夹** | 收藏常用和弦，首页快速跳转查看 |
| **🌙 暗色模式** | 白天/夜间主题一键切换，护眼舒适 |
| **💾 保存图片** | 指板图一键保存到相册 |

## 📱 预览

选择根音（C / D / E / F / G / A / B...）→ 选择和弦类型（大三 / 小三 / 属七 / 大七...）→ 查看指板图 → 试听和弦发声 → 收藏常用和弦

## 🛠️ 技术栈

- **微信小程序原生开发**（WXML + WXSS + JavaScript）
- **Canvas 2D API** 指板图渲染
- **Karplus-Strong 算法** 吉他音色合成
- **CSS 自定义变量** 实现暗色模式
- **按需注入 + 用时注入** 性能优化

## 📁 项目结构

```
guitar-chord-heatmap/
├── app.js / app.json / app.wxss     # 应用入口 + 全局配置 + 全局样式
├── pages/
│   ├── index/                        # 首页：和弦选择 + 收藏夹
│   └── result/                       # 结果页：指板图 + 和弦说明 + 试听
├── components/
│   ├── fretboard-viewer/             # 指板图 Canvas 组件
│   └── placeholder/                  # 用时注入占位组件
└── utils/
    ├── chordDatabase.js              # 和弦指法数据库
    ├── fretboard.js                  # 指法搜索算法
    ├── draw.js                       # Canvas 绘图引擎
    ├── chordExplanations.js          # 和弦功能/调性说明
    └── audioEngine.js                # Karplus-Strong 音色合成
```

## 🚀 本地运行

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，目录选择 `guitar-chord-heatmap`
3. 填入你的小程序 AppID（或在 `project.config.json` 中修改 `appid`）
4. 按 `Ctrl+B` 编译预览

## 📄 版本

`v1.0.0` — 首次发布
