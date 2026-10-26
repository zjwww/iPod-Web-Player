# Verification — 0.2.0

Date: 2026-10-26. This records observed results separately from platform assumptions. Final deployment evidence is kept in the local project work records.

## Automated checks

17 Node tests pass: five library/tag/WAV cases, three theme cases, and nine Pages/playback cases. The new cases cover project-subdirectory catalog resolution, external/traversal/duplicate rejection, byte ranges and offline 206 contents, app-specific cache cleanup, relative manifest/resources, original click sample bounds/identity, wheel angle wrapping, synchronous playback dispatch with bounded seeking/volume/repeat, and the included WAV's actual header/data.

Source syntax and publication checks pass. The OFL font has SHA-256 `89c8ac4608f8702a7139ee1838544f1e0ba28ed7306e847a8689fd4a6b87f6b9`. The original test WAV is 1,058,444 bytes / 24 seconds, SHA-256 `4150c17e420350ed8683a50213e470d2ddeaa6d04f847fd04313b9b5e2cb7dea`.

## Desktop runtime observations

- Windows Chrome **155.0.8059.85**: native desktop UI loaded the included track and reached `0:24` without a playback error. Chrome was controlled through native UI because its browser bridge was not connected.
- Windows Edge **156.0.4314.42**: the actual Edge tab loaded the included catalog and reached `0:24`. Browser playback, CJK labels and menu controls were inspected independently of the in-app preview.
- Chromium in-app preview: audio element reported duration 24, readyState 4, paused false, error null, and later currentTime 20.288435. Center + ArrowUp changed volume from 80% to 76%. Immersive fallback worked with nativeFullscreen false.
- Responsive desktop simulation: stable portrait CSS viewport 325×703 had device bounds x=19.00, y=137.39, 287.00×478.56; stable landscape 879×406 had x=329.08, y=18.84, 221.28×368.99. Both fit within the viewport; scrollWidth equaled viewport width. Helper text measured 14 CSS px. These are actual measured CSS sizes, not the requested outer viewport dimensions.

## Safari-specific implementation and limits

Audio play/context resume run within the user gesture, the test audio is standard PCM WAV, Pointer Events and touch-action are used for the wheel, native fullscreen has an immersive fallback, and the install hint directs Safari users to Add to Home Screen. Relative same-site URLs, scoped manifest/cache keys, and offline single-range 206 responses are covered by tests.

**No physical iOS/iPadOS Safari session was available.** Real touch rotation, Home Screen installation, lock-screen/background playback, actual device output and storage eviction are not marked passed. Desktop Chromium viewport checks are not an iOS/Safari test. Test the deployed HTTPS URL on the target iPhone/iPad.

## Publication boundary

## Published HTTPS verification

- Public repository: https://github.com/zjwww/iPod-Web-Player ; Pages: https://zjwww.github.io/iPod-Web-Player/ . GitHub identifies the license as MIT, the repository is public, and HTTPS is enforced.
- Build and deployment succeeded: https://github.com/zjwww/iPod-Web-Player/actions/runs/40316025539 . Initial application commit: `e5076571327299cf0aa1f899b2c95ad6131c7899`.
- All 20 published static files were HTTP 200 and byte-identical to their committed versions. The audio range probe returned 206, `Content-Range: bytes 0-43/1058444`, and the correct 44-byte WAV header.
- Native Chrome loaded the real Pages URL, showed APP CACHED / HTTPS STATIC WEB APP, and played the included track; the captured screenshot shows `0:17`. Native Edge reached `0:24` on the real Pages URL. Mouse dragging around the actual wheel moved selection from Playlists to Settings; pressing the physical center opened Settings.
- Remote tree audit found no AGENTS files, vendor snapshots, old v0.1.x releases, work, outputs or runtime files.
- Optional Windows launcher started on a test port, directly served WAV as `audio/wav`, then stopped with its own Stop command and reported offline. The direct check bypassed proxies and used IPv4/localhost Host matching, as the status helper does. This is not a new run of all historical lifecycle tests.
- Cache-ready status and unit-level offline range behavior are verified; a real-device network-disconnection/lock-screen test has not been claimed.

## Public files

The public implementation is newly written and includes no original/derived Apple component, embedded Chicago font, click recording, textures or game. Root/version licenses are MIT; the bundled Noto SC font keeps its complete OFL license/provenance. Historical v0.1.x directories and vendor snapshots remain local. The publish allowlist must exclude every AGENTS file, runtime record, work/output artifact and vendor snapshot before Git synchronization.
