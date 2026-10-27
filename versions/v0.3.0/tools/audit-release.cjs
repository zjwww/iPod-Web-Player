/* SPDX-License-Identifier: MIT. Publication allowlist and asset integrity. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),version=path.resolve(__dirname,'..');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assets=JSON.parse(fs.readFileSync(path.join(version,'asset-provenance.json'),'utf8'));
for(const asset of assets.assets){const file=path.resolve(version,asset.path);if(!file.startsWith(version+path.sep))throw Error('Invalid asset path');if(hash(file)!==asset.sha256)throw Error('Asset hash mismatch: '+asset.path);if(!asset.license||!asset.source)throw Error('Asset provenance incomplete');}
function inspect(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  if(entry.name==='.runtime')continue;
  const file=path.join(directory,entry.name);if(entry.isSymbolicLink())throw new Error('Unexpected link: '+file);
  if(/^(AGENTS(?:\.override)?\.md|reference|comparison|reference-.*|wheel-noise\.png)$/i.test(entry.name))throw new Error('Private file in release: '+file);
  if(entry.isDirectory())inspect(file);else if(file.startsWith(path.join(version,'dist')+path.sep)&&/\.(js|css|html|json|webmanifest)$/.test(entry.name)){
    const text=fs.readFileSync(file,'utf8');
    if(/data:(?:audio|font)|web-music-ipod\.esm|ipod\.local\.js|\$\$\.ctx|svelte-[a-z\d]|LocalReferenceSkin|0\.3\.0-local/i.test(text))throw new Error('Historical derivative marker: '+file);
  }
}}
inspect(version);
if(process.argv.includes('--tracked')){
  const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
  const rootFiles=new Set(['.gitignore','.gitattributes','LICENSE','README.md','README.zh-CN.md','CHANGELOG.md','CHANGELOG.zh-CN.md','THIRD_PARTY_NOTICES.md']);
  for(const name of tracked){if(!rootFiles.has(name)&&name!=='.github/workflows/pages.yml'&&!/^versions\/v0\.(2|3)\.0\//.test(name))throw new Error('Outside publication allowlist: '+name);if(/(^|\/)(AGENTS(?:\.override)?\.md|\.runtime|reference|comparison)(\/|$)/i.test(name))throw new Error('Local instruction/runtime file tracked: '+name);}
  console.log('Tracked publication allowlist passed: '+tracked.length+' files');
}
console.log('Public asset licenses and integrity passed: '+assets.assets.length+' assets');
