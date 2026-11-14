
(function(){
'use strict';
var N=5,S=10,T=14,DIRS=[[-1,0],[0,1],[1,0],[0,-1]],BACK=[2,3,0,1];
var utcDate=new Date().toISOString().slice(0,10),dayCode=utcDate.replace(/-/g,'');
var root=document.getElementById('board'),tiles=[],goal=[],path=[],moves=0,hints=0,win=false,started=Date.now(),rotationLog=[],rankedEligible=true,submitted=false,shareTargetUrl='https://rometet.github.io/remote-services/tools/switchyard.html',historyKey='switchyard-v2-'+utcDate;
function el(id){return document.getElementById(id)}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),16777619)}return h>>>0}
var seed=hash('switchyard:'+utcDate),random=function(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function neighbor(i,d){var r=Math.floor(i/N),c=i%N,rr=r+DIRS[d][0],cc=c+DIRS[d][1];return rr<0||cc<0||rr>=N||cc>=N?-1:rr*N+cc}
function buildPath(){
for(var attempt=0;attempt<350;attempt++){
var seen=new Set([S]),p=[S];
function visit(cur){if(cur===T)return p.length>=10&&p.length<=19; if(p.length>=19)return false;
var ds=shuffle([0,1,2,3]);for(var k=0;k<ds.length;k++){var nxt=neighbor(cur,ds[k]);if(nxt<0||seen.has(nxt))continue;seen.add(nxt);p.push(nxt);if(visit(nxt))return true;p.pop();seen.delete(nxt)}return false}
if(visit(S))return p.slice();
}
return [10,11,6,7,8,13,12,17,18,19,14];
}
function rotate(conn,turn){return conn.map(function(d){return(d+turn)%4})}
function determine(){
path=buildPath();goal=new Array(N*N);
for(var i=0;i<N*N;i++){var idx=path.indexOf(i),connections=[];
if(idx>=0){if(idx>0)for(var d=0;d<4;d++)if(neighbor(i,d)===path[idx-1])connections.push(d);
if(idx<path.length-1)for(var e=0;e<4;e++)if(neighbor(i,e)===path[idx+1])connections.push(e);
}else{var a=Math.floor(random()*4);connections=[a,(a+1+Math.floor(random()*3))%4]}
goal[i]=connections;
}
tiles=goal.map(function(conns){return {base:conns.slice(),turn:Math.floor(random()*4)}});
if(powered().has(T)){tiles[S].turn=(3-tiles[S].base[0]+4)%4}
}
function connections(i){return rotate(tiles[i].base,tiles[i].turn)}
function powered(){
var reached=new Set([S]),queue=[S];
while(queue.length){var pos=queue.shift(),con=connections(pos);
for(var a=0;a<con.length;a++){var d=con[a],next=neighbor(pos,d);if(next<0||reached.has(next))continue;
if(connections(next).indexOf(BACK[d])!==-1){reached.add(next);queue.push(next)}
}}
return reached}
function segments(i,lit){var ds=connections(i),lines='';
for(var k=0;k<ds.length;k++){var p=[[50,5],[95,50],[50,95],[5,50]][ds[k]];
lines+='<line class="wire" x1="50" y1="50" x2="'+p[0]+'" y2="'+p[1]+'"/>'}
return '<svg viewBox="0 0 100 100" aria-hidden="true"><g>'+lines+'<circle class="hub" cx="50" cy="50" r="8"/></g></svg>'}
function streak(){try{var d=JSON.parse(localStorage.getItem('switchyard-streak')||'{}');return d.count||0}catch(e){return 0}}
function persist(){try{localStorage.setItem(historyKey,JSON.stringify({turns:tiles.map(function(t){return t.turn}),moves:moves,hints:hints,win:win,started:started,rotationLog:rotationLog,rankedEligible:rankedEligible,submitted:submitted}))}catch(e){}}
function render(){
var live=powered();root.innerHTML='';
for(var i=0;i<N*N;i++){var button=document.createElement('button');button.className='tile'+(live.has(i)?' live':'')+((i===S||i===T)?' terminal':'');
button.type='button';button.dataset.index=String(i);button.dataset.badge=i===S?'START':i===T?'EXIT':'';
button.setAttribute('aria-label','Row '+(Math.floor(i/N)+1)+', column '+(i%N+1)+(i===S?', start':i===T?', exit':'')+(live.has(i)?', powered':', not powered')+'. Rotate clockwise.');
button.setAttribute('aria-pressed',live.has(i)?'true':'false');button.innerHTML=segments(i,live.has(i));button.addEventListener('click',rotateClick);button.disabled=win;root.appendChild(button)}
el('moves').textContent=String(moves);el('flow').textContent=live.size+' / '+(N*N);el('streak').textContent=String(streak());
el('hint').disabled=win;el('share').disabled=false;
if(live.has(T)&&!win){win=true;el('hint').disabled=true;root.querySelectorAll('.tile').forEach(function(t){t.disabled=true});var sec=Math.max(1,Math.round((Date.now()-started)/1000));var s=currentStreak();
el('status').className='message win';el('status').textContent='⚡ Circuit completed in '+moves+' rotations ('+hints+' hints). '+sec+'s. Streak: '+s+' day'+(s===1?'':'s')+'!';persist();if(rankedEligible&&!submitted){postScore()}
}else if(!win){el('status').className='message';el('status').textContent='Only connected wires carry power. Find the shortest route and light up the EXIT.'}
}

function setLeaderboard(data){
 if(data&&typeof data.postUrl==='string'&&data.postUrl.startsWith('https://www.reddit.com/r/'))shareTargetUrl=data.postUrl;
 var count=el('community-count');if(count&&data&&Number.isInteger(data.players)){count.textContent=data.players===0?'⚡ Be first to finish today!':'⚡ '+data.players+' players completed today!'}
 var box=el('leaderboard-list');if(!box)return;box.textContent='';
 if(!data||!Array.isArray(data.leaders)||!data.leaders.length){box.textContent='No verified scores yet — be first!';return}
 data.leaders.slice(0,10).forEach(function(item,i){
  var row=document.createElement('div');row.className='rank-row';
  var position=document.createElement('strong');position.textContent=(i+1)+'.';
  var name=document.createElement('span');name.textContent='u/'+String(item.username||'player');name.className='rank-name';
  var score=document.createElement('b');score.textContent=String(item.moves)+' turns';
  row.append(position,name,score);box.appendChild(row)
 });
}
function loadLeaderboard(){
 if(typeof fetch!=='function')return;
 fetch('/api/leaderboard',{credentials:'same-origin'}).then(function(r){if(!r.ok)throw Error('unavailable');return r.json()}).then(setLeaderboard).catch(function(){var elmt=el('leaderboard-list');if(elmt)elmt.textContent='Community scores are temporarily unavailable. The puzzle remains playable.'});
}
function postScore(){
 if(typeof fetch!=='function')return;
 el('retry').hidden=true;
 fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({day:utcDate,rotations:rotationLog})})
 .then(function(r){if(!r.ok)throw Error('Score not saved');return r.json()})
 .then(function(data){setLeaderboard(data);if(data.verified){submitted=true;persist();el('status').textContent+=' 🏆 Verified score added to the Reddit leaderboard.'}})
 .catch(function(){submitted=false;persist();el('retry').hidden=false;el('status').textContent+=' (Local win saved; Reddit score unavailable. Tap Retry score.)'});
}

function rotateClick(evt){if(new Date().toISOString().slice(0,10)!==utcDate){location.reload();return}if(win)return;var i=Number(evt.currentTarget.dataset.index);tiles[i].turn=(tiles[i].turn+1)%4;moves++;rotationLog.push(i);if(rotationLog.length>250)rankedEligible=false;persist();render()}
function currentStreak(){var yesterday=new Date(Date.parse(utcDate+'T00:00:00Z')-86400000).toISOString().slice(0,10);
var count=1;try{var prev=JSON.parse(localStorage.getItem('switchyard-streak')||'{}');if(prev.last===utcDate)count=prev.count||1;else if(prev.last===yesterday)count=(prev.count||0)+1;localStorage.setItem('switchyard-streak',JSON.stringify({last:utcDate,count:count}))}catch(e){}return count}
function hint(){if(new Date().toISOString().slice(0,10)!==utcDate){location.reload();return}if(win)return;var incorrect=path.filter(function(i){var x=connections(i).slice().sort().join(','),y=goal[i].slice().sort().join(',');return x!==y});
if(!incorrect.length){el('status').textContent='All intended path tiles are aligned. Rotate connected branches to complete the circuit.';return}
var i=incorrect[Math.floor(random()*incorrect.length)],rotation=0;for(var t=0;t<4;t++){if(rotate(goal[i],t).slice().sort().join(',')===connections(i).slice().sort().join(',')){rotation=t;break}}
var old=tiles[i].turn;for(var q=0;q<4;q++){if(rotate(tiles[i].base,q).slice().sort().join(',')===goal[i].slice().sort().join(',')){tiles[i].turn=q;break}}
if(tiles[i].turn===old)return;rankedEligible=false;hints++;moves+=3;persist();render();var node=root.children[i];if(node){node.focus();node.style.boxShadow='0 0 0 2px #f4c46b';setTimeout(function(){node.style.boxShadow=''},900)}}
function reset(){if(new Date().toISOString().slice(0,10)!==utcDate){location.reload();return}seed=hash('switchyard:'+utcDate);determine();moves=0;hints=0;win=false;rotationLog=[];rankedEligible=true;submitted=false;started=Date.now();persist();render()}
async function share(){var text='SWITCHYARD '+utcDate+'\n'+(win?'⚡ Connected in '+moves+' rotations · '+hints+' hints':'🔧 Still connecting the circuit')+'\nPlay: '+shareTargetUrl;
try{await navigator.clipboard.writeText(text);el('status').textContent='Result copied — share with your friends!'}catch(e){window.prompt('Copy this result:',text)}}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&new Date().toISOString().slice(0,10)!==utcDate)location.reload()});
el('day').textContent='DAILY '+dayCode;determine();
try{var saved=JSON.parse(localStorage.getItem(historyKey)||'null');if(saved&&Array.isArray(saved.turns)&&saved.turns.length===N*N){for(var i=0;i<N*N;i++){var v=Number(saved.turns[i]);if(Number.isInteger(v)&&v>=0&&v<=3)tiles[i].turn=v}moves=Number(saved.moves)||0;hints=Number(saved.hints)||0;started=Number(saved.started)||Date.now();win=Boolean(saved.win);rotationLog=Array.isArray(saved.rotationLog)?saved.rotationLog:[];rankedEligible=Boolean(saved.rankedEligible);submitted=Boolean(saved.submitted)}}catch(e){}
if(win){var count=streak();el('status').className='message win';el('status').textContent='⚡ Today\'s circuit completed in '+moves+' rotations! Your streak: '+count+'.'}
el('hint').addEventListener('click',hint);el('reset').addEventListener('click',reset);el('share').addEventListener('click',share);el('retry').addEventListener('click',function(){if(win&&rankedEligible&&!submitted){postScore()}});render();if(win&&rankedEligible&&!submitted)el('retry').hidden=false;loadLeaderboard();
})();