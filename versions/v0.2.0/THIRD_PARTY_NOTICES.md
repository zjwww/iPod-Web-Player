# Third-party notices / 第三方说明

## Public release 0.2.0 / 公开版本

`dist/player-core.js` and `dist/wheel-player.js` are independently implemented. The public release does not redistribute Apple's original/derived JavaScript, embedded font, click audio, textures or brick game; no Svelte runtime is used. Original code, icons and synthesized media are MIT licensed. Apple, iPod and Apple Music are third-party names/marks; this project is not affiliated with or endorsed by Apple. MIT does not grant trademark rights or rights in historical third-party material.

Earlier experimental versions and original snapshots remain local and ignored by Git. Their historical notices record their provenance. A publicly accessible script was not treated as a redistribution license. Review references: [Apple website terms](https://www.apple.com/legal/internet-services/terms/site.html), [GitHub Pages educational-use requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits#educational-exercises).

公开代码为独立实现，不分发 Apple 原始／衍生脚本、内嵌字体、按键音、纹理或游戏，不依赖 Svelte。原创代码、图标、合成媒体按 MIT 分发，第三方名称及标识不在授权范围。本项目与 Apple 无关联，未获得背书。旧实验版和快照继续本地保留并被 Git 忽略，其历史来源记录保持原样；未将公开可访问视为再分发授权。审查参考以上 Apple 和 GitHub 官方条款。

## Noto Sans SC webfont / 中文网页字体

- Upstream: [Google Fonts / Noto Sans SC](https://github.com/google/fonts/tree/2894aab31764f10f29c421bdfd2340d3b382d384/ofl/notosanssc), commit `2894aab31764f10f29c421bdfd2340d3b382d384`.
- Copyright 2014–2021 Adobe, Reserved Font Name “Source”. SIL Open Font License 1.1; complete license at `versions/v0.2.0/dist/fonts/OFL-NotoSansSC.txt`.
- Modification: instantiate regular weight 400 and convert to WOFF2, retaining all 30,890 Unicode mappings. Browser-only, no system font installation.
- WOFF2 SHA-256: `89c8ac4608f8702a7139ee1838544f1e0ba28ed7306e847a8689fd4a6b87f6b9`.
- Details: `versions/v0.2.0/font-provenance.json`.

中文字体固定在上述提交，版权归 Adobe，依 SIL OFL 1.1 独立分发，完整许可证随包提供。转换为常规字重 WOFF2，保留全部 Unicode 映射，仅在浏览器使用，不安装系统字体。

## Original test music / 原创测试音乐

`versions/v0.2.0/dist/audio/first-spin.wav`: First Spin / 转动之间, 24 seconds, generated from the original procedural composition in `dist/library.js:createDemo`, with `tools/prepare-pages.cjs`. MIT licensed, no third-party recording or melody sample. Encoding and exact hash are recorded in `audio-provenance.json`.

测试音乐为原创程序合成，不包含第三方录音或旋律采样，按 MIT 分发，生成方法、编码及哈希随版本提供。
