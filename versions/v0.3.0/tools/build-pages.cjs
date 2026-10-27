/* SPDX-License-Identifier: MIT. Publish only the current static app. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),source=path.resolve(__dirname,'../dist'),target=path.join(root,'work/pages-site');
if(!fs.existsSync(path.join(source,'audio/first-spin.wav')))throw new Error('Generate test audio with prepare-pages.cjs first');
// Remove only this tool's generated staging folder, after resolving its boundary.
if(target!==path.resolve(root,'work','pages-site')||!target.startsWith(path.resolve(root,'work')+path.sep))throw new Error('Unsafe staging path');
fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(target,{recursive:true});
function copy(directory,relative=''){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(entry.isSymbolicLink())throw new Error('Publishing symlinks is not allowed');
    const rel=path.join(relative,entry.name),from=path.join(directory,entry.name),to=path.join(target,rel);
    if(entry.isDirectory()){fs.mkdirSync(to,{recursive:true});copy(from,rel);}
    else{if(/^(AGENTS(?:\.override)?\.md|ipod\.local\.js)$/i.test(entry.name))throw new Error('Local/private historical file in site');fs.copyFileSync(from,to);}
  }
}
copy(source);fs.writeFileSync(path.join(target,'.nojekyll'),'');
console.log('GitHub Pages artifact: '+target);
