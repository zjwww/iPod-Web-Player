'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {attachTheme}=require('../dist/theme.js');
function fixture(dark,legacy=false){
  let handler;const attributes={},meta={},root={style:{},setAttribute:(name,value)=>{attributes[name]=value;}};
  const media={matches:dark};
  if(legacy){media.addListener=callback=>{handler=callback;};media.removeListener=()=>{handler=null;};}
  else{media.addEventListener=(name,callback)=>{assert.equal(name,'change');handler=callback;};media.removeEventListener=()=>{handler=null;};}
  return {root,attributes,meta,media,themeMeta:{setAttribute:(name,value)=>{meta[name]=value;}},change(value){media.matches=value;if(handler)handler({matches:value});}};
}
test('system light preference sets the document and browser chrome consistently',()=>{const f=fixture(false);attachTheme(f.root,f.media,f.themeMeta);assert.equal(f.attributes['data-theme'],'light');assert.equal(f.root.style.colorScheme,'light');assert.equal(f.meta.content,'#f3f3f3');});
test('system dark preference applies before interaction and updates live in both directions',()=>{const f=fixture(true);attachTheme(f.root,f.media,f.themeMeta);assert.equal(f.attributes['data-theme'],'dark');assert.equal(f.meta.content,'#1f1f1f');f.change(false);assert.equal(f.attributes['data-theme'],'light');f.change(true);assert.equal(f.root.style.colorScheme,'dark');});
test('legacy MediaQueryList listener fallback remains functional and disposable',()=>{const f=fixture(false,true),controller=attachTheme(f.root,f.media,f.themeMeta);f.change(true);assert.equal(f.attributes['data-theme'],'dark');controller.dispose();f.change(false);assert.equal(f.attributes['data-theme'],'dark');});

