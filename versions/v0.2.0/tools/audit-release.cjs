/* SPDX-License-Identifier: MIT. Publication allowlist and asset integrity. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),version=path.resolve(__dirname,'..');
const expectedFont='89c8ac4608f8702a7139ee1838544f1e0ba28ed7306e847a8689fd4a6b87f6b9';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(hash(path.join(version,'dist/fonts/NotoSansSC-Regular.woff2'))!==expectedFont)throw new Error('Bundled OFL font changed');
const audio=JSON.parse(fs.readFileSync(path.join(version,'audio-provenance.json'),'utf8'));
if(hash(path.join(version,'dist/audio/first-spin.wav'))!==audio.sha256)throw new Error('Test audio hash mismatch');
function inspect(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  if(entry.name==='.runtime')continue;
  const file=path.join(directory,entry.name);if(entry.isSymbolicLink())throw new Error('Unexpected link: '+file);
  if(entry.isDirectory())inspect(file);else if(/\.(js|cjs|css|html|json|webmanifest)$/.test(entry.name)){
    const text=fs.readFileSync(file,'utf8');
    if(/data:(?:audio|font)|web-music-ipod\.esm|ipod\.local\.js|\$\$\.ctx|svelte-[a-z\d]/i.test(text)&&entry.name!=='audit-release.cjs'&&entry.name!=='build-pages.cjs'&&entry.name!=='pages.test.cjs')throw new Error('Historical derivative marker: '+file);
  }
}}
inspect(version);
if(process.argv.includes('--tracked')){
  const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
  const rootFiles=new Set(['.gitignore','.gitattributes','LICENSE','README.md','README.zh-CN.md','CHANGELOG.md','CHANGELOG.zh-CN.md','THIRD_PARTY_NOTICES.md']);
  for(const name of tracked){if(!rootFiles.has(name)&&!name.startsWith('.github/workflows/')&&!name.startsWith('versions/v0.2.0/'))throw new Error('Outside publication allowlist: '+name);if(/(^|\/)(AGENTS(?:\.override)?\.md|\.runtime)(\/|$)/i.test(name))throw new Error('Local instruction/runtime file tracked: '+name);}
  console.log('Tracked publication allowlist passed: '+tracked.length+' files');
}
console.log('Original component, OFL font and MIT test audio audit passed');
