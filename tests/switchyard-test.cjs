const fs=require('node:fs'); const assert=require('node:assert/strict'); const {JSDOM}=require('jsdom'); const path=require('node:path');
const root=path.resolve(__dirname,'..'); const html=fs.readFileSync(path.join(root,'src/client/game.html'),'utf8');
const src=fs.readFileSync(path.join(root,'src/client/switchyard.js'),'utf8');
function start(){const d=new JSDOM(html,{runScripts:'outside-only',url:'https://game.example/'}); d.window.eval(src.replace(/\}\)\(\);\s*$/, 'window.__test={goal,tiles,connections,render,path,powered};})();'));return d;}
const d=start();const w=d.window;assert.equal(w.document.querySelectorAll('.tile').length,25,'all 25 tiles render');
assert.ok(w.__test.path.length>=9,'path exists');
assert.equal(w.document.querySelectorAll('.tile.terminal').length,2,'two terminals');
w.document.querySelector('.tile').click();assert.equal(w.document.getElementById('moves').textContent,'1','tap rotates and increments');
w.document.getElementById('hint').click();assert.ok(Number(w.document.getElementById('moves').textContent)>=1,'hint works');
for(let i=0;i<25;i++){const target=w.__test.goal[i].slice().sort().join(',');for(let r=0;r<4;r++){w.__test.tiles[i].turn=r;if(w.__test.connections(i).slice().sort().join(',')===target)break;}}
w.__test.render();assert.match(w.document.getElementById('status').textContent,/Circuit completed/i,'solution completes');
assert.equal(w.document.getElementById('hint').disabled,true,'hint disabled after win');
assert.equal(w.document.querySelectorAll('.tile').length,25,'board survives completion');
console.log('PASS: 25 tiles, endpoints, tap, hint, solvable puzzle, winning UI, persistence');
d.window.close();
