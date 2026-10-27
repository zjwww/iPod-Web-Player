/* Local player server and scoped lifecycle control; no uploads or telemetry. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {parseRange}=require('./dist/range.js');
const args=process.argv.slice(2),portIndex=args.indexOf('--port'),port=portIndex>=0?Number(args[portIndex+1]):8765;
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Port must be between 1024 and 65535');
const host=args.includes('--lan')?'0.0.0.0':'127.0.0.1',appRoot=path.resolve(__dirname),root=path.join(appRoot,'dist'),versionPath='/v0.3.1/';
const runtime=path.join(appRoot,'.runtime'),stateFile=path.join(runtime,'player-'+port+'.json'),instanceId=crypto.randomUUID().replace(/-/g,''),stopFile=path.join(runtime,'stop-'+instanceId+'.signal');
const appId='apple-ipod-web-player',version='0.3.1',startedUtc=new Date().toISOString();
let startTimeTicks='';
if(process.platform==='win32'){
  startTimeTicks=cp.execFileSync('powershell.exe',['-NoLogo','-NoProfile','-Command','(Get-Process -Id '+process.pid+').StartTime.ToUniversalTime().Ticks.ToString()'],{windowsHide:true,encoding:'utf8',timeout:5000}).trim();
  if(!/^\d{16,20}$/.test(startTimeTicks))throw new Error('Could not identify this process start time');
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const sockets=new Set();let closing=false,poll;
function cleanup(){
  try{const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(state.InstanceId===instanceId)fs.unlinkSync(stateFile);}catch(_){}
  try{fs.unlinkSync(stopFile);}catch(_){}
}
function shutdown(){
  if(closing)return;closing=true;clearInterval(poll);
  for(const socket of sockets)socket.destroy();
  server.close(()=>{cleanup();process.exit(0);});
  setTimeout(()=>{cleanup();process.exit(0);},2000).unref();
}
const server=http.createServer((request,response)=>{
  if(!['GET','HEAD'].includes(request.method)){response.writeHead(405,{'Allow':'GET, HEAD','Cache-Control':'no-store'});response.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);}catch(_){response.writeHead(400);response.end();return;}
  if(pathname==='/__ipod/status'){
    const text=JSON.stringify({appId,version,instanceId,processId:process.pid,transport:'node',startedUtc,status:'running'});
    response.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, max-age=0','Content-Length':Buffer.byteLength(text)});
    response.end(request.method==='HEAD'?undefined:text);return;
  }
  if(pathname==='/v0.3.1'){response.writeHead(302,{'Location':versionPath});response.end();return;}
  if(pathname.startsWith(versionPath))pathname='/'+pathname.slice(versionPath.length);
  const target=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(target!==root&&!target.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  fs.stat(target,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404);response.end('Not found');return;}
    const range=request.headers.range?parseRange(request.headers.range,stat.size):null;
    if(request.headers.range&&!range){response.writeHead(416,{'Content-Range':'bytes */'+stat.size});response.end();return;}
    const headers={'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Length':range?range.end-range.start+1:stat.size,'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
    if(range)headers['Content-Range']=`bytes ${range.start}-${range.end}/${stat.size}`;
    response.writeHead(range?206:200,headers);
    if(request.method==='HEAD')response.end();else{const stream=fs.createReadStream(target,range||{});stream.on('error',()=>response.destroy());response.on('close',()=>stream.destroy());stream.pipe(response);}
  });
});
server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
server.on('error',error=>{try{fs.mkdirSync(runtime,{recursive:true});fs.appendFileSync(path.join(runtime,'server-'+port+'.error.log'),String(error.stack||error)+'\n');}catch(_){}console.error('Could not start player:',error.message);cleanup();process.exitCode=1;});
server.listen(port,host,()=>{
  fs.mkdirSync(runtime,{recursive:true});
  const state={AppId:appId,Version:version,Root:appRoot,Port:port,ProcessId:process.pid,StartTimeTicks:startTimeTicks,InstanceId:instanceId,Transport:'node',StartedUtc:startedUtc};
  const temporary=stateFile+'.'+instanceId+'.tmp';fs.writeFileSync(temporary,JSON.stringify(state));fs.renameSync(temporary,stateFile);
  poll=setInterval(()=>{if(fs.existsSync(stopFile))shutdown();},75);poll.unref();
  console.log('Apple iPod Web Player v0.3.1\nLocal: http://127.0.0.1:'+port+versionPath+'\nStop: Stop-Player.cmd -Port '+port);
});
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);process.on('exit',cleanup);
