/* SPDX-License-Identifier: MIT. Static hosting does not have a local health API. */
(function(){
  'use strict';let online=false,checked=false;
  const element=document.getElementById('server-state');if(!element)return;
  const host=location.hostname,local=host==='localhost'||host==='127.0.0.1'||host==='[::1]'||/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host);
  function render(){const zh=document.documentElement.lang.startsWith('zh');let text;
    if(location.protocol==='file:')text=zh?'本地文件':'LOCAL FILE';
    else if(!local)text=location.protocol==='https:'?'HTTPS · STATIC WEB APP':'STATIC WEB APP';
    else text=checked?(online?(zh?'服务在线':'SERVICE ONLINE'):(zh?'本地服务已停止':'LOCAL SERVER STOPPED')):'';
    element.textContent=text?' · '+text:'';
  }
  async function check(){
    if(!local||!/^https?:$/.test(location.protocol)){render();return;}
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1500);
    try{const response=await fetch(new URL('/__ipod/status',location.href),{cache:'no-store',credentials:'omit',signal:controller.signal});const value=response.ok?await response.json():null;online=value?.appId==='apple-ipod-web-player'&&value.status==='running';}
    catch(_){online=false;}finally{clearTimeout(timer);checked=true;render();}
  }
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});if(local)setInterval(()=>{if(!document.hidden)check();},5000);check();
})();
