'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseCatalog}=require('../dist/catalog.js'),{parseRange}=require('../dist/range.js'),core=require('../dist/player-core.js');
const dist=path.resolve(__dirname,'../dist');
const catalog=JSON.parse(fs.readFileSync(path.join(dist,'tracks.json'),'utf8'));
test('hosted catalog resolves under GitHub project subpath and remains separate from local imports',()=>{
  const records=parseCatalog(catalog,'https://zjwww.github.io/iPod-Web-Player/');assert.equal(records[0].url,'https://zjwww.github.io/iPod-Web-Player/audio/first-spin.wav');assert.equal(records[0].id,'hosted:first-spin');assert.equal(records[0].hosted,true);
});
test('catalog rejects external URLs, traversal, duplicate IDs and invalid schema',()=>{
  const make=url=>({version:1,tracks:[{id:'x',name:'<untrusted title>',url}]});
  for(const url of ['https://other.example/song.mp3','//other.example/a.mp3','../secret.mp3','./%2e%2e/secret.mp3','/root.mp3','javascript:alert(1)','./a.mp3?token=secret','./a.mp3#x'])assert.throws(()=>parseCatalog(make(url),'https://host.example/player/'));
  assert.throws(()=>parseCatalog({version:1,tracks:[...catalog.tracks,...catalog.tracks]},'https://host.example/'));assert.throws(()=>parseCatalog({},'https://host.example/'));
});
test('byte ranges implement Safari prefix, suffix, open end, clamp and unsatisfiable cases',()=>{
  assert.deepEqual(parseRange('bytes=0-1',100),{start:0,end:1});assert.deepEqual(parseRange('bytes=90-',100),{start:90,end:99});assert.deepEqual(parseRange('bytes=-8',100),{start:92,end:99});assert.deepEqual(parseRange('bytes=80-500',100),{start:80,end:99});
  for(const header of ['bytes=100-','bytes=90-80','bytes=-0','bytes=0-1,4-5','bytes=-','junk'])assert.equal(parseRange(header,100),null);
});
test('offline service worker returns the requested bytes and does not delete another application cache',async()=>{
  const handlers={},removed=[],samples=new Uint8Array([10,20,30,40,50]);let response;
  const cache={match:async()=>new Response(samples,{headers:{'Content-Type':'audio/wav'}})};
  const self={location:{href:'https://host.example/player/sw.js'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}},skipWaiting:async()=>{}};
  const prefix='ipod-web-player:'+encodeURIComponent('/player/')+':';
  const context={self,URL,Headers,Response,PlayerRange:{parseRange},HostedCatalog:{parseCatalog},importScripts:()=>{},fetch:()=>{throw Error('offline');},caches:{open:async()=>cache,keys:async()=>[prefix+'old',prefix+'v0.3.0','another-app'],delete:async key=>removed.push(key)}};
  vm.runInNewContext(fs.readFileSync(path.join(dist,'sw.js'),'utf8'),context);
  handlers.fetch({request:new Request('https://host.example/player/audio/first-spin.wav',{headers:{Range:'bytes=1-3'}}),respondWith:promise=>response=promise});
  const result=await response;assert.equal(result.status,206);assert.equal(result.headers.get('Content-Range'),'bytes 1-3/5');assert.deepEqual([...new Uint8Array(await result.arrayBuffer())],[20,30,40]);
  let activation;handlers.activate({waitUntil:promise=>activation=promise});await activation;assert.deepEqual(removed,[prefix+'old']);
});
test('manifest identity and app resources remain relative to deployment directory',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(dist,'manifest.webmanifest'),'utf8'));assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');assert.ok(manifest.start_url.startsWith('./'));
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="(\.\/[^"?]+)"/g))assert.ok(fs.existsSync(path.join(dist,match[1])),match[1]);assert.ok(!html.includes('ipod.local.js'));
});
test('original click samples are bounded, non-silent and identical when copied to stereo',()=>{
  const left=core.clickSamples(48000),right=core.clickSamples(48000);assert.equal(left.length,864);assert.deepEqual(left,right);assert.ok(left.some(value=>Math.abs(value)>.01));assert.ok(left.every(value=>Math.abs(value)<1));
});
test('wheel angle wraps smoothly across the zero boundary',()=>{assert.ok(Math.abs(core.angleDelta(-Math.PI+.1,Math.PI-.1)-.2)<1e-10);assert.equal(core.clock(125.9),'2:05');});
class FakeAudio extends EventTarget{
  constructor(){super();this.paused=true;this.ended=false;this.duration=24;this.currentTime=0;this.calls=[];}
  setAttribute(){} removeAttribute(){} load(){} play(){this.calls.push('play');this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();} pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
}
test('play starts within the user call, and repeat/seek/volume remain bounded',()=>{
  const player=new core.Playback({AudioClass:FakeAudio,contextFactory:()=>{throw Error('Web Audio unavailable');}}),songs=[{id:'a',previewUrl:'./a.wav'},{id:'b',previewUrl:'./b.wav'}];
  player.play(songs);assert.deepEqual(player.audio.calls,['play']);assert.equal(player.audio.src,'./a.wav');assert.equal(player.state.isPlaying,true);player.seek(80);assert.equal(player.audio.currentTime,24);player.setVolume(2);assert.equal(player.volume,1);
  player.repeat='one';player.audio.dispatchEvent(new Event('ended'));assert.equal(player.audio.currentTime,0);assert.equal(player.index,0);player.skipNext();assert.equal(player.index,1);player.audio.currentTime=0;player.skipPrevious();assert.equal(player.index,0);player.pause();assert.equal(player.state.isPlaying,false);
});
test('included test music is an actual self-contained PCM WAV with declared provenance',()=>{
  const bytes=fs.readFileSync(path.join(dist,'audio/first-spin.wav'));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');assert.equal(bytes.readUInt16LE(20),1);assert.equal(bytes.length,1058444);assert.equal(bytes.readUInt16LE(22),1);
});
