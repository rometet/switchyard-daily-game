import {generateBoard, powerNetwork, SOURCE, TARGET} from '../src/shared/engine.ts';
const start = Date.UTC(2026,10,14);
let initiallySolved=[], minPath=999, maxPath=0, zeroDifferential=0, checked=0;
const fail=[];
for (let k=0;k<1095;k++){
 const date=new Date(start+k*86400000).toISOString().slice(0,10);
 const b=generateBoard(date);
 checked++;
 if(powerNetwork(b).has(TARGET)) initiallySolved.push(date);
 minPath=Math.min(minPath,b.path.length);maxPath=Math.max(maxPath,b.path.length);
 if(b.path[0]!==SOURCE || b.path.at(-1)!==TARGET) fail.push({date,reason:'endpoints'});
 const perfect={base:b.base,turns:b.turns.slice()};
 for(const p of b.path){let found=false;for(let rotation=0;rotation<4;rotation++){const c=b.base[p].map(d=>(d+rotation)%4).sort().join(',');if(c===b.base[p].slice().sort().join(',')){perfect.turns[p]=rotation;found=true;break}}if(!found)fail.push({date,reason:'rotation impossible'})}
 if(!powerNetwork(perfect).has(TARGET))fail.push({date,reason:'intended-path-unreachable'});
}
console.log(JSON.stringify({days:checked,minPath,maxPath,initiallySolvedCount:initiallySolved.length,initiallySolved:initiallySolved.slice(0,10),failCount:fail.length,fail:fail.slice(0,10)},null,2));
if(fail.length || initiallySolved.length)process.exitCode=1;