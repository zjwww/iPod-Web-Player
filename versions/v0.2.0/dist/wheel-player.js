/* SPDX-License-Identifier: MIT. Original click-wheel component; no Apple source/assets. */
(function () {
  'use strict';
  const words = {
    en: { playlists:'Playlists', artists:'Artists', songs:'Songs', settings:'Settings', now:'Now Playing', empty:'No music yet', all:'All Songs', shuffle:'Shuffle', repeat:'Repeat', click:'Clicker', light:'Backlight', about:'About', on:'On', off:'Off', one:'One', reset:'Reset settings', unknown:'Unknown Artist', volume:'Volume', seek:'Playback progress', menu:'Back / MENU', select:'Select', previous:'Previous track', next:'Next track', toggle:'Play / pause', hint:'Use arrow keys, Enter, Escape, or turn the wheel.', of:'of' },
    zh: { playlists:'播放列表', artists:'歌手', songs:'歌曲', settings:'设置', now:'正在播放', empty:'暂无音乐', all:'所有歌曲', shuffle:'随机播放', repeat:'重复播放', click:'按键音', light:'屏幕背光', about:'关于', on:'开', off:'关', one:'单曲', reset:'重置设置', unknown:'未知歌手', volume:'音量', seek:'播放进度', menu:'返回 / MENU', select:'选择', previous:'上一首', next:'下一首', toggle:'播放 / 暂停', hint:'可用方向键、Enter、Escape，或沿圆环转动。', of:'/' }
  };
  const css = `
    :host{display:block;width:415px;height:692px;outline:none;font:400 25px/1.35 ui-monospace,"SFMono-Regular",Consolas,"iPodCJK",sans-serif;color:#35404b;color-scheme:light}
    *{box-sizing:border-box}button{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}button:focus-visible{outline:3px solid #416782;outline-offset:-3px}
    .shell{position:relative;width:415px;height:692px;overflow:hidden;border:4px solid #9a9b98;border-radius:43px;background:linear-gradient(125deg,#f8f8f7 0%,#e8e9e8 34%,#d7d8d6 75%,#fafafa 100%);box-shadow:inset 0 0 0 3px #f6f6f5,inset 0 0 0 7px #bcbdbb,0 2px 2px #0004}
    .bezel{position:absolute;left:62px;top:30px;width:283px;height:235px;padding:11px;border-radius:12px;background:linear-gradient(145deg,#41443f,#a6a8a1 38%,#6c6e68 77%,#353832);box-shadow:inset 0 1px 4px #000b}
    .lcd{height:100%;background:linear-gradient(110deg,#c1d2e1,#d5e5fa 85%,#ecf6ff);box-shadow:inset 0 0 12px #5c71883d;overflow:hidden}
    .lcd.dim{background:#c5ccc3;box-shadow:inset 0 0 10px #4d594b26;color:#495348}
    .titlebar{height:34px;display:flex;gap:6px;align-items:center;border-bottom:2px solid #68757d;padding:0 7px;background:#b2c5d84a;font-size:23px;line-height:32px}
    .title{flex:1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}.playing{font-size:15px;width:12px;flex:none}.battery{width:28px;height:15px;position:relative;border:2px solid currentColor;flex:none;background:repeating-linear-gradient(90deg,transparent 0 2px,currentColor 2px 5px)}.battery:after{content:"";position:absolute;right:-5px;top:3px;width:3px;height:6px;background:currentColor}
    .body{height:179px;overflow:hidden}.row{width:100%;height:35px;border:0;background:none;padding:1px 9px;display:flex;align-items:center;justify-content:space-between;gap:5px;text-align:left;line-height:33px;font-size:24px;cursor:pointer}.row .name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.row .value{font-size:19px;white-space:nowrap}.row.selected{background:#4f5961;color:#fff}.empty{padding:7px;text-align:center;font-size:23px}.chevron{font-size:30px;line-height:30px}
    .wheel{position:absolute;left:29px;bottom:34px;width:350px;height:350px;border:2px solid #aaaead;border-radius:50%;background:radial-gradient(circle at 38% 30%,#fafafa,#e5e6e5 69%,#d4d5d3 96%);box-shadow:0 3px 7px #0004,inset 1px 2px 2px #fff;touch-action:none;user-select:none;-webkit-user-select:none}
    .wheel:before{content:"";position:absolute;inset:39px;border:2px solid #b3b5b1;border-radius:50%;background:linear-gradient(135deg,#f9f9f8,#ededeb);box-shadow:0 2px 6px #0004;pointer-events:none}
    .key{position:absolute;border:0;background:transparent;color:#8f9692;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:none;padding:0}.key svg{width:26px;height:26px;fill:currentColor}.menu{top:0;left:106px;width:134px;height:53px;font:700 23px/1 Arial,sans-serif;letter-spacing:.5px}.previous{left:0;top:133px;width:50px;height:80px}.next{right:0;top:133px;width:50px;height:80px}.toggle{bottom:0;left:115px;width:116px;height:50px}.select{left:125px;top:125px;width:96px;height:96px;border:2px solid #a4aaa5;border-radius:50%;background:linear-gradient(135deg,#f5f5f3,#e3e4e2);box-shadow:inset 0 1px 2px #fff}.key:active{filter:brightness(.86)}
    .now{padding:8px 11px;font-size:18px;line-height:27px}.position{font-size:15px;line-height:20px}.song{font-size:22px;font-weight:600;line-height:29px}.song,.artist,.album{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.artist,.album{font-size:18px;line-height:27px}.meter{height:9px;border:1px solid #637282;margin-top:7px;overflow:hidden}.fill{height:100%;background:#526b82;width:0}.times{display:flex;justify-content:space-between;font:15px/24px ui-monospace,monospace}.mode{font-size:14px;line-height:19px;text-align:center}.about{padding:14px 12px;font-size:20px;line-height:32px}.about p{margin:0}.about small{font-size:15px;line-height:24px;display:block}
    @font-face{font-family:iPodCJK;src:url("./fonts/NotoSansSC-Regular.woff2") format("woff2");font-weight:400;font-display:swap}
  `;
  class WheelPlayer extends HTMLElement {
    constructor() {
      super(); this.attachShadow({mode:'open'}); this._data={songs:[],artists:[],playlists:[]}; this.view={type:'root',index:0}; this.stack=[]; this.clicker=true; this.backlight=true; this.mode='seek';
      this._player=new PlayerCore.Playback({onError:()=>window.dispatchEvent(new CustomEvent('ipod-playback-error'))});
      this._store={set:value=>{if(value.data)this._data=value.data;this.render();}};
      this.shadowRoot.innerHTML=`<style>${css}</style><div class="shell"><div class="bezel"><div class="lcd"><div class="titlebar"><span class="playing"></span><span class="title">iPod</span><span class="battery" aria-label="Decorative battery icon"></span></div><div class="body"></div></div></div><div class="wheel"><button class="key menu" data-action="menu">menu</button><button class="key previous" data-action="previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h3v14H3zM7 12l7-7v14zM14 12l7-7v14z"/></svg></button><button class="key next" data-action="next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5h3v14h-3zM3 5l7 7-7 7zM10 5l7 7-7 7z"/></svg></button><button class="key toggle" data-action="toggle"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5l10 7-10 7zM15 5h3v14h-3zM20 5h3v14h-3z"/></svg></button><button class="key select" data-action="select"></button></div></div>`;
      this._player.audio.hidden=true;this.shadowRoot.append(this._player.audio);
      this.wheel=this.shadowRoot.querySelector('.wheel'); this.body=this.shadowRoot.querySelector('.body');
      this._unsubscribe=this._player.subscribe(state=>{const before=this.playing;this.playing=state.isPlaying;this.state=state;if(this.view.type==='now')this.renderNow();else if(before!==this.playing)this.render();});
      this.wheel.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.action;if(!action)return;if(this.suppressClick){this.suppressClick=false;return;}this.action(action);});
      this.wheel.addEventListener('pointerdown',event=>this.pointerStart(event));
      this.wheel.addEventListener('pointermove',event=>this.pointerMove(event));
      for(const name of ['pointerup','pointercancel','lostpointercapture'])this.wheel.addEventListener(name,()=>this.pointerEnd());
      this.wheel.addEventListener('wheel',event=>{event.preventDefault();this.rotate(Math.sign(event.deltaY));},{passive:false});
      this.addEventListener('keydown',event=>{
        const actions={ArrowUp:()=>this.rotate(-1),ArrowDown:()=>this.rotate(1),Enter:()=>this.action('select'),Escape:()=>this.action('menu'),' ':()=>this.action('toggle'),ArrowLeft:()=>this.action('previous'),ArrowRight:()=>this.action('next')};
        if(actions[event.key]){event.preventDefault();event.stopPropagation();actions[event.key]();}
      });
    }
    connectedCallback(){if(!this.hasAttribute('tabindex'))this.tabIndex=0;this.setAttribute('role','group');this.render();}
    disconnectedCallback(){this.pointerEnd();this._unsubscribe();this._player.destroy();}
    get iPodDataStore(){return this._store;}
    get localPlaybackStore(){return this._player;}
    showNowPlaying(){if(this.view.type!=='now')this.navigate('now');else this.render();}
    set locale(value){this._language=value?.language;this.render();}
    get text(){return words[(this._language||this.lang||'en').startsWith('zh')?'zh':'en'];}
    sound(){if(this.clicker)this._player.click();}
    navigate(type,id,title){this.stack.push({...this.view});this.view={type,id,title,index:0};this.render();}
    list(){
      const t=this.text,d=this._data,p=this._player,entry=(name,run,value)=>({name,run,value});
      if(this.view.type==='root')return [entry(t.playlists,()=>this.navigate('playlists')),entry(t.artists,()=>this.navigate('artists')),entry(t.songs,()=>this.navigate('songs')),entry(t.settings,()=>this.navigate('settings')),...(p.queue.length?[entry(t.now,()=>this.navigate('now'))]:[])];
      if(this.view.type==='artists'||this.view.type==='playlists')return d[this.view.type].map(item=>entry(item.name,()=>this.navigate('songs',item.id,item.name)));
      if(this.view.type==='songs'){
        const group=[...d.artists,...d.playlists].find(item=>item.id===this.view.id);
        const songs=group?group.songIds.map(id=>d.songs.find(song=>song.id===id)).filter(Boolean):d.songs;
        return songs.map((song,index)=>entry(song.name,()=>{p.play(songs,index);this.navigate('now');}));
      }
      if(this.view.type==='settings')return [entry(t.shuffle,()=>{p.shuffle=!p.shuffle;this.render();},p.shuffle?t.on:t.off),entry(t.repeat,()=>{p.repeat=['off','all','one'][(['off','all','one'].indexOf(p.repeat)+1)%3];this.render();},t[p.repeat]),entry(t.click,()=>{this.clicker=!this.clicker;this.render();},this.clicker?t.on:t.off),entry(t.light,()=>{this.backlight=!this.backlight;this.render();},this.backlight?t.on:t.off),entry(t.about,()=>this.navigate('about')),entry(t.reset,()=>{p.shuffle=false;p.repeat='off';p.setVolume(.8);this.backlight=true;this.clicker=true;this.render();})];
      return [];
    }
    action(action){
      this.focus({preventScroll:true});this.sound();const p=this._player;
      if(action==='select'){if(this.view.type==='now'){this.mode=this.mode==='seek'?'volume':'seek';this.renderNow();}else this.list()[this.view.index]?.run();}
      if(action==='menu'){if(this.view.type==='root'&&p.queue.length)this.navigate('now');else this.view=this.stack.pop()||{type:'root',index:0};this.render();}
      if(action==='toggle'){if(p.queue.length)p.toggle();else if(this._data.songs.length){p.play(this._data.songs,0);this.navigate('now');}}
      if(action==='previous')p.skipPrevious();if(action==='next')p.skipNext();
    }
    rotate(step){
      if(!step)return;this.sound();if(this.view.type==='now'){if(this.mode==='volume')this._player.setVolume(this._player.volume+step*.04);else this._player.seek(this._player.audio.currentTime+step*3);return;}
      const count=this.list().length;if(!count)return;this.view.index=PlayerCore.clamp(this.view.index+step,0,count-1);this.render();
    }
    pointerStart(event){
      if(event.button!==0)return;this.suppressClick=false;this.focus({preventScroll:true});this._player.resumeAudio();
      const target=event.target.closest('button');if(target?.dataset.action==='select')return;
      const rect=this.wheel.getBoundingClientRect();this.drag={id:event.pointerId,cx:rect.left+rect.width/2,cy:rect.top+rect.height/2,last:Math.atan2(event.clientY-rect.top-rect.height/2,event.clientX-rect.left-rect.width/2),sum:0,moved:0};
      event.target.setPointerCapture(event.pointerId);
      if(target?.dataset.action==='menu')this.hold=setTimeout(()=>{this.backlight=!this.backlight;this.suppressClick=true;this.render();},650);
      else if(['previous','next'].includes(target?.dataset.action))this.hold=setTimeout(()=>{this.suppressClick=true;this.seekHold=setInterval(()=>this._player.seek(this._player.audio.currentTime+(target.dataset.action==='next'?3:-3)),180);},650);
    }
    pointerMove(event){
      if(!this.drag||this.drag.id!==event.pointerId)return;const d=this.drag,angle=Math.atan2(event.clientY-d.cy,event.clientX-d.cx),change=PlayerCore.angleDelta(angle,d.last);d.last=angle;d.sum+=change;d.moved+=Math.abs(change);
      if(d.moved>.14){clearTimeout(this.hold);clearInterval(this.seekHold);this.suppressClick=true;}
      if(Math.abs(d.sum)>.24){const steps=Math.trunc(d.sum/.24);d.sum-=steps*.24;this.rotate(PlayerCore.clamp(steps,-8,8));}
    }
    pointerEnd(){clearTimeout(this.hold);clearInterval(this.seekHold);this.drag=null;}
    render(){
      if(!this.body)return;const t=this.text;
      this.setAttribute('aria-label','iPod Player. '+t.hint);
      const labels={menu:t.menu,select:t.select,previous:t.previous,next:t.next,toggle:t.toggle};for(const button of this.wheel.querySelectorAll('button'))button.setAttribute('aria-label',labels[button.dataset.action]);
      this.shadowRoot.querySelector('.lcd').classList.toggle('dim',!this.backlight);this.shadowRoot.querySelector('.playing').textContent=this.playing?'▶':'';
      this.shadowRoot.querySelector('.title').textContent=this.view.title||({root:'iPod',songs:t.songs,artists:t.artists,playlists:t.playlists,settings:t.settings,now:t.now,about:t.about}[this.view.type]||'iPod');
      if(this.view.type==='now'){this.renderNow();return;}
      this.body.replaceChildren();
      if(this.view.type==='about'){const box=document.createElement('div');box.className='about';for(const line of ['iPod Web Player','v0.2.0',this._data.songs.length+' '+t.songs,'Independent · MIT']){const p=document.createElement('p');p.textContent=line;box.append(p);}this.body.append(box);return;}
      const items=this.list();this.view.index=PlayerCore.clamp(this.view.index,0,Math.max(0,items.length-1));
      if(!items.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=t.empty;this.body.append(empty);return;}
      const start=Math.max(0,Math.min(this.view.index-3,items.length-5));
      for(let index=start;index<Math.min(start+5,items.length);index++){
        const item=items[index],row=document.createElement('button'),name=document.createElement('span'),end=document.createElement('span');row.type='button';row.className='row'+(index===this.view.index?' selected':'');row.setAttribute('aria-current',index===this.view.index?'true':'false');name.className='name';name.textContent=item.name;end.className=item.value?'value':'chevron';end.textContent=item.value||'›';row.append(name,end);row.addEventListener('click',()=>{this.view.index=index;this.sound();item.run();});this.body.append(row);
      }
    }
    renderNow(){
      const state=this.state||this._player.state,song=state.queue[state.currentTrackIndex],t=this.text;if(!song){this.view={type:'root',index:0};this.render();return;}
      if(!this.body.querySelector('.now'))this.body.innerHTML='<div class="now"><div class="position"></div><div class="song"></div><div class="artist"></div><div class="album"></div><div class="meter"><div class="fill"></div></div><div class="times"><span></span><span></span></div><div class="mode"></div></div>';
      const set=(selector,value)=>{this.body.querySelector(selector).textContent=value;};set('.position',(state.currentTrackIndex+1)+' '+t.of+' '+state.queue.length);set('.song',song.name);set('.artist',song.artistName||t.unknown);set('.album',song.albumName||' ');
      const volume=this.mode==='volume',duration=state.currentPlaybackDuration,ratio=volume?this._player.volume:(duration?state.currentPlaybackTime/duration:0);
      this.body.querySelector('.fill').style.width=PlayerCore.clamp(ratio*100,0,100)+'%';const times=this.body.querySelector('.times');times.firstElementChild.textContent=volume?t.volume:PlayerCore.clock(state.currentPlaybackTime);times.lastElementChild.textContent=volume?Math.round(this._player.volume*100)+'%':'−'+PlayerCore.clock(duration-state.currentPlaybackTime);set('.mode',volume?t.volume:t.seek);this.shadowRoot.querySelector('.playing').textContent=state.isPlaying?'▶':'Ⅱ';
    }
  }
  customElements.define('web-music-ipod',WheelPlayer);
})();
