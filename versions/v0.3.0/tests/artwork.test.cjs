/* SPDX-License-Identifier: MIT. Public asset boundaries and offline graph. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const version=path.resolve(__dirname,'..'),dist=path.join(version,'dist');
test('every service-worker shell asset exists; private comparison assets are absent',()=>{
  const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);e.isDirectory()?walk(p):files.push(p);}}walk(dist);
  assert.ok(!files.some(p=>/reference-|wheel-noise|comparison|svelte/i.test(p)));
  const sw=fs.readFileSync(path.join(dist,'sw.js'),'utf8');
  for(const match of sw.slice(0,sw.indexOf("self.addEventListener('install'")).matchAll(/'\.\/([^']*)'/g))assert.ok(fs.existsSync(path.join(dist,match[1])),match[1]);
  for(const p of files.filter(p=>/\.(css|html)$/.test(p)))for(const match of fs.readFileSync(p,'utf8').matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g))assert.ok(fs.existsSync(path.resolve(path.dirname(p),match[1])),p+' -> '+match[1]);
});
test('project vector drawings retain curved lettering, complete battery and safe static markup',()=>{
  const window={};vm.runInNewContext(fs.readFileSync(path.join(dist,'appearance/player-artwork.js'),'utf8'),{window});const art=window.PlayerArtwork;
  assert.equal((art.menu.match(/<text /g)||[]).length,4);assert.ok(art.menu.includes('rotate(-9'));assert.ok(art.menu.includes('rotate(9'));assert.ok(art.battery.includes('viewBox="0 0 110 56"'));
  for(const svg of Object.values(art)){assert.ok(svg.startsWith('<svg'));assert.ok(!/script|onload|href=/i.test(svg));}
});
test('the release inventory verifies all redistributed artwork, font and music hashes',()=>{
  const out=cp.execFileSync(process.execPath,[path.join(version,'tools/audit-release.cjs')],{encoding:'utf8'});assert.match(out,/integrity passed/);
});
