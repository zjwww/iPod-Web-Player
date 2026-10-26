# iPod Web Player

[English](README.md) · [打开播放器](https://zjwww.github.io/iPod-Web-Player/)

独立的学习用途 click wheel 网页音乐播放器。**本项目与 Apple 无关联，未获得其赞助或背书。** 当前版本：**0.2.0 — 2026-10-26**。

## 直接使用

打开 **https://zjwww.github.io/iPod-Web-Player/**，点击“播放测试音乐”，或者从设备的“歌曲”菜单选择歌曲。访问托管网页无需 Node.js、PowerShell、账号或 App 安装。用户操作后开始播放。

原创 24 秒测试音乐 **First Spin · 转动之间** 位于 `versions/v0.2.0/dist/audio/first-spin.wav`，使用 22,050 Hz、单声道、16 位 PCM WAV，依 MIT 分发。`tools/prepare-pages.cjs` 从 `dist/library.js:createDemo` 重现该音频，`audio-provenance.json` 记录 SHA-256。不包含商业歌曲或 Apple Music 试听。

点击“添加音乐”、浏览器支持时使用“选择文件夹”，或者将文件拖入页面导入自己的音乐。导入文件仅复制到当前浏览器的 IndexedDB，不上传。“清空导入音乐”只移除浏览器副本，保留预置歌曲和原始文件。

## 操作

- 鼠标沿圆环拖动、手指沿圆环滑动、鼠标滚轮或 ↑/↓ 浏览；中央键／Enter 选择，MENU／Escape 返回。
- 播放时中央键切换进度与音量模式，底部播放／暂停，两侧切歌、长按快进／快退；长按 MENU 切换背光。
- 播放列表和歌手按可获得的元数据分组，支持 MP3 ID3 标签，其他文件以文件名／目录回退。
- 支持清晰双语菜单、系统深浅色和响应式沉浸布局；电池图标仅为装饰。

## iOS Safari 与 PWA

在 Safari 打开 **HTTPS Pages 地址**，点击一次“播放测试音乐”。AudioContext 恢复与原生音频播放均在用户交互内同步调用，不先等待下载。测试歌曲为标准 PCM WAV；离线 worker 和可选 Node 服务支持单段字节范围请求，供进度访问使用。

通过 **分享 → 添加到主屏幕**，出现“作为 Web App 打开”时启用。原生全屏进行能力检测，不支持时回退到沉浸布局。安装不保证全屏、无限期后台／锁屏播放或永久存储，这些仍由系统／浏览器控制。

worker 按部署路径缓存网页、曲库和预置音乐，缓存名称与 manifest 身份限定在该路径；导入音乐另存于 IndexedDB。清除网站数据会影响曲库和离线资源，播放器内清空按钮仅删除导入项。普通 HTTP 局域网可以基本播放，但通常不能启用 Service Worker。

**验证范围：** Windows Chrome 和 Edge 播放分别检查。**2026-10-26，用户真机确认：iOS 27.0.1 的 Safari 可以正常播放预置测试音乐。** 此项属于用户反馈的基础播放验证，未提供设备型号。手机竖／横屏布局及 Safari 针对性路径另有桌面／静态检查；该设备的主屏幕安装、触摸滚轮、离线播放和锁屏／后台播放尚未确认。视口模拟不等于 Safari 测试。版本内 `VERIFICATION.zh-CN.md` 保留发布时记录，后续反馈以本段及根目录更新日志为准。

## 添加托管音乐

将有权公开分发的音频放入 `versions/v0.2.0/dist/audio/`，在 `dist/tracks.json` 添加条目并保留 `version: 1`：

```json
{"id":"my-track","name":"我的歌曲","artist":"歌手","album":"测试专辑","url":"./audio/my-track.mp3","type":"audio/mpeg"}
```

ID 必须唯一，使用站内相对地址。外部地址和越出播放器目录的路径会被拒绝，曲名以文本显示。仓库音乐公开，本地导入音乐保留在浏览器。后续发布请创建新 `versions/vX.Y.Z/` 并更新 workflow／缓存版本，不覆盖已交付版本。离线安装会下载预置曲库，添加大曲库前需评估总大小。

兼容优先使用 MP3；PCM WAV／FLAC 可作无损选择。AAC/M4A、Ogg/Opus、WebM、AIFF 取决于实际编码及浏览器／系统支持。可选择文件不保证可以播放，不支持 DRM 保护文件。

## 可选 Windows 本地启动器

`versions/v0.2.0/Start-Player.cmd` 使用 Windows 已有 PowerShell 5.1 + .NET HttpListener，地址 `http://localhost:8765/v0.2.0/`。不安装组件，后台是普通隐藏进程，不注册 Windows 系统服务。用 Stop-Player.cmd 停止、Status-Player.cmd 查询，关闭启动窗口不会停服。

Start-LAN.cmd 使用 **已经安装且位于 PATH 的 Node.js**，端口 8766，对应 Stop-LAN.cmd／Status-LAN.cmd。Node 仅用于可选开发，Pages 访问者不需要，脚本不修改防火墙。

## 开发和部署

无需 npm 包或构建时下载。已有 Node 时可运行：

```sh
node --test versions/v0.2.0/tests/*.test.cjs
node versions/v0.2.0/tools/audit-release.cjs --tracked
node versions/v0.2.0/tools/build-pages.cjs
node versions/v0.2.0/server.cjs --port 8765
```

固定提交的官方 Actions workflow 检查代码及跟踪白名单，仅复制当前 `dist/` 到 `work/pages-site` 后部署。其他仓库初次配置选择 **Settings → Pages → GitHub Actions**。运行资源兼容仓库子目录，静态托管不探测本地服务健康接口。

## 许可证与历史

原创代码、CSS／SVG／PNG 图标、合成按键音和测试音乐使用 **MIT**，见 [LICENSE](LICENSE)。Noto Sans SC 字体保留独立的 **SIL OFL 1.1**，见[第三方说明](THIRD_PARTY_NOTICES.md)。

公开滚轮为原创实现，不包含 Apple JavaScript／衍生代码、内嵌 Chicago 字体、按键音、纹理或 Svelte 运行时。旧实验版和快照保留在本地，不进入公开仓库。MIT 不授予 Apple／iPod 商标权，旧组件的打砖块游戏不包含在公开重写版中。
