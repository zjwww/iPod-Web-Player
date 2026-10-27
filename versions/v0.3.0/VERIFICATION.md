# Verification — 0.3.0, 2026-10-27

[简体中文](VERIFICATION.zh-CN.md)

## Asset scope and preservation

- A pre-release SHA-256 snapshot covers 304 existing version/archive/vendor files, excluding runtime state. All remain unchanged. The approved `v0.3.0-local` and its ZIP remain local, untouched and ignored.
- Original CSS drawings, SVG controls/lettering/battery and procedural grain replace extracted reference assets. No original Apple script, skin file, SVG data, PNG texture or saved comparison runtime is included. The local reference was consulted; this is not described as clean-room development.
- ChicagoKare is byte-identical to its pinned MIT upstream: 9,400 bytes, SHA-256 `3213740318940270dc4e099b15d49b5781bdf6208660aa970daa5c62d24bcdc4`. Full license, unchanged internal OFL provenance and authors are disclosed. Noto SC retains OFL. The inventory checks 12 media/font/artwork/license hashes.
- Playback core is byte-identical to 0.2.0: `dc4e51fb44e06c779f2a972b40d3fd6d6ac0aad4a9a4a28c326895ae6c3fda55`. Original test WAV remains `4150c17e420350ed8683a50213e470d2ddeaa6d04f847fd04313b9b5e2cb7dea`.

## Local verification

- 20 Node tests pass: library/tag parsing, relative hosted catalog, invalid URL rejection, native playback activation, click channel identity, seek/repeat/volume, Safari offline byte ranges, cache isolation, manifest paths, live system themes, public artwork/license integrity and complete offline asset graph.
- Controlled approved-versus-public comparison retains a 415×692 shell, 350px wheel, 276px plate, 100px center and 0.9 normal scale. Measured shell/screen/header/title/menu/wheel geometry and screen ink are retained. New material/letter drawings and procedural grain are visually comparable, not represented as pixel-identical Apple assets.
- Chromium in-app preview: the included WAV played through 24 seconds, duration24, readyState4, error null. MENU and keyboard arrows/Enter opened Settings; Chinese settings title has a 32px line box (28.8px rendered at 0.9), fitting the 33.3px header; rows render at 27px.
- Mobile viewport simulation: 390×844 gives a 352×586.95 device at x19/y153.52; 844×390 gives 211.10×352 at x316.45/y19. Document dimensions equal the viewport, no overflow; reflection and contact-shadow display are disabled in immersive mode.
- Default Windows PowerShell/.NET launcher starts on a separate test port. Health reports 0.3.0; HTML, CSS, JS, SVG, WOFF2, credits and WAV return200 with correct MIME. Scoped Stop ends only this test instance. No software, service, font or firewall installation.
- Pages assembly copies only the current static dist. The publication audit permits historical public 0.2.0 and current 0.3.0 plus documented root/workflow files; instruction files, private history, snapshots, runtime and comparison are excluded. The ZIP includes a full SHA-256 manifest and is checked entry-by-entry.

## Verification limits

Desktop Chrome/Edge playback evidence for 0.2.0 and the user's iOS27.0.1 Safari basic-playback confirmation remain historical. This release's new runtime checks use the Chromium in-app preview; no new physical iOS Safari, Chrome/Edge native UI, Firefox, Home Screen, touch-wheel, background/lock-screen or storage-eviction pass is claimed. Native audio code and WAV bytes are unchanged. Desktop viewport testing is not real Safari verification.

The system-theme unit tests and CSS cover both palettes; full OS/browser antialiasing and physical speaker balance are outside these checks. Equal digital click samples do not calibrate hardware.

Pages workflow status, deployment revision, live byte hashes/HTTP ranges and online preview results are recorded after deployment in the local publication record, rather than retroactively editing an archived release. An existing 0.2.0 service worker may show the old page on the first visit; reload after the new worker activates. This does not require clearing imported music.
