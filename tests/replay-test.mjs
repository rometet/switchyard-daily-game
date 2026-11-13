import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generateBoard, verifyReplay } from '../src/shared/engine.ts';
const require=createRequire(import.meta.url);
const {JSDOM}=require('jsdom');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(path.join(root,'src/client/game.html'),'utf8');
const js=readFileSync(path.join(root,'src/client/switchyard.js'),'utf8');
const exposed=js.replace(/\}\)\(\);\s*$/,'window.__test={goal,tiles,rotationLog,path,connections};})();');
assert.notEqual(js,exposed,'test hook injection must work');
const dates=Array.from({length:30},(_,i)=>new Date(Date.UTC(2026,10,13+i)).toISOString().slice(0,10));
for(const date of dates){
  const d=new JSDOM(html,{runScripts:'outside-only',url:'https://game.example/'});
  const OriginalDate=d.window.Date;
  d.window.Date=class extends OriginalDate{
    constructor(...args){if(args.length===0)super(date+'T12:00:00Z');else super(...args)}
    static now(){return OriginalDate.parse(date+'T12:00:00Z')}
  };
  d.window.eval(exposed);
  const w=d.window,board=generateBoard(date),test=w.__test;
  assert.deepEqual(Array.from(test.tiles,t=>t.turn),board.turns,'same seeded turns: '+date);
  assert.deepEqual(Array.from(test.goal,c=>Array.from(c)),board.base,'same generated wire graph: '+date);
  assert.deepEqual(Array.from(test.path),board.path,'same backbone path: '+date);
  const rank=w.document.getElementById('status');
  for(const tile of board.path){
    const goal=board.base[tile].slice().sort().join(',');
    for(let i=0;i<4&&!rank.classList.contains('win');i++){
      if(Array.from(test.connections(tile)).sort().join(',')===goal)break;
      w.document.querySelectorAll('.tile')[tile].click();
    }
    if(rank.classList.contains('win'))break;
  }
  assert.ok(rank.classList.contains('win'),'solution must win: '+date);
  assert.equal(verifyReplay(date,Array.from(test.rotationLog)).ok,true,'server must verify real browser clicks: '+date);
  assert.equal(verifyReplay(date,Array.from(test.rotationLog).concat([0])).ok,false,'post-win forgery rejected: '+date);
  assert.equal(verifyReplay(date,[99]).ok,false,'invalid move rejected: '+date);
  d.window.close();
}
console.log('PASS: 30 UTC dates; browser/server boards identical; actual replay verified; forgery rejected');
