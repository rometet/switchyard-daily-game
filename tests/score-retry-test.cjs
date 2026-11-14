const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'src/client/game.html'),'utf8');
const src=fs.readFileSync(path.join(root,'src/client/switchyard.js'),'utf8');
const exposed=src.replace(/\}\)\(\);\s*$/, 'window.__test={goal,tiles,connections,render,path};})();');
assert.notEqual(src,exposed,'test hook available');
async function flush(){await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));}
function create(saved,fetcher){
 const d=new JSDOM(html,{runScripts:'outside-only',url:'https://switchyard.example/'});
 for(const [key,value] of Object.entries(saved||{}))d.window.localStorage.setItem(key,value);
 d.window.fetch=fetcher;
 d.window.eval(exposed);
 return d;
}
(async()=>{
 let postAttempts=0;
 const offline=()=>Promise.reject(new Error('offline'));
 const first=create({},(url,init)=>{
  if(String(url).includes('/api/score'))postAttempts++;
  return offline();
 });
 const w=first.window;
 const t=w.__test;
 for(let i=0;i<25;i++){
  const target=Array.from(t.goal[i]).sort().join(',');
  for(let n=0;n<4;n++){
   t.tiles[i].turn=n;
   if(Array.from(t.connections(i)).sort().join(',')===target)break;
  }
 }
 t.render();
 await flush();
 assert.equal(postAttempts,1,'one score attempt after win');
 assert.match(w.document.getElementById('status').textContent,/Retry score/,'offline win provides a retry');
 assert.equal(w.document.getElementById('retry').hidden,false,'retry button shown after failed submit');
 const store={};
 for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);store[k]=w.localStorage.getItem(k)}
 first.window.close();
 let secondPostAttempts=0;
 const online=create(store,(url,init)=>{
  if(String(url).includes('/api/score')){secondPostAttempts++;return Promise.resolve({ok:true,json:async()=>({verified:true,leaders:[{rank:1,username:'Rome6882',moves:7}],players:1})})}
  return Promise.resolve({ok:true,json:async()=>({leaders:[],players:0})});
 });
 const w2=online.window;
 assert.equal(w2.document.getElementById('retry').hidden,false,'retry button restored after reload');
 w2.document.getElementById('retry').click();
 await flush();
 assert.equal(secondPostAttempts,1,'retry sends a fresh score request');
 assert.equal(w2.document.getElementById('retry').hidden,true,'retry hidden after successful save');
 const key=Object.keys(store).find(x=>x.startsWith('switchyard-v2-'));
 assert.ok(key,'persistence key found');
 assert.equal(JSON.parse(w2.localStorage.getItem(key)).submitted,true,'success persisted after server confirmation');
 online.window.close();
 console.log('PASS: failed score restores retry after reload; server confirmation persists success');
})().catch(e=>{console.error(e);process.exitCode=1});