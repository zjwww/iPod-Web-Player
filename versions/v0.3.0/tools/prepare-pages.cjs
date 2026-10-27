/* SPDX-License-Identifier: MIT. Reproducible original test audio and static site. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),lib=require('../dist/library.js');
const root=path.resolve(__dirname,'..');
async function main(){
  const file=path.join(root,'dist/audio/first-spin.wav'),bytes=Buffer.from(await lib.createDemo().arrayBuffer());
  if(fs.existsSync(file)&&!fs.readFileSync(file).equals(bytes))throw new Error('Refusing to overwrite different delivered test audio');
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
  const provenance={title:'First Spin / 转动之间',source:'Original procedural composition in dist/library.js:createDemo',license:'MIT',seconds:24,sampleRate:22050,channels:1,encoding:'16-bit PCM WAV',sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  fs.writeFileSync(path.join(root,'audio-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
  console.log(JSON.stringify(provenance));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
