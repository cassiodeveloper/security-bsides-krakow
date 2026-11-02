import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync('js/hacker-club-projects.js','utf8');
class Element {
  children=[]; value=''; textContent=''; attributes={}; events={};
  constructor(tag='div'){this.tag=tag;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,fn){this.events[name]=fn;}
  set innerHTML(value){throw Error('Unsafe HTML rendering');}
}
async function mount(projects, error=false) {
  const nodes=new Map();const root={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,new Element());return nodes.get(selector);}};
  const document={querySelector:()=>root,createElement:tag=>new Element(tag)};
  vm.runInNewContext(source,{document,fetch:async()=>{if(error)throw Error('offline');return {ok:true,json:async()=>({schema_version:1,generated_at:'2026-11-02T00:00:00Z',projects})};},Date,Set,Number,String});
  await new Promise(resolve=>setImmediate(resolve));
  return {get:s=>nodes.get(s),nodes};
}
const fixture={id:'D_1',title:'Alpha',description:'Text',category:'Hardware & Electronics',status:'Proposed',kind:'idea',votes:0,updated_at:'2026-11-02T00:00:00Z',discussion_url:'https://github.com/Security-BSides-Krakow/hacker-club-projects/discussions/1'};
function text(node){return node.textContent+node.children.map(text).join(' ');}
test('empty dataset explains how to start and displays real zero',async()=>{const app=await mount([]);assert.match(app.get('[data-project-message]').textContent,/No project ideas/);assert.equal(app.get('[data-count="Proposed"]').textContent,0);});
test('network error has useful GitHub fallback and leaves statistics unavailable',async()=>{const app=await mount([],true);assert.match(app.get('[data-project-message]').textContent,/temporarily unavailable/);assert.equal(app.get('[data-project-grid]').children.length,0);});
test('unknown status and missing vote are visible and filterable',async()=>{const app=await mount([{...fixture,status:'Legacy',votes:null}]);assert.match(text(app.get('[data-project-grid]')),/Unknown/);assert.match(text(app.get('[data-project-grid]')),/Not available/);assert.ok(app.get('#project-status').children.some(n=>n.value==='Unknown'));});
test('untrusted content stays text and invalid action links never render',async()=>{const app=await mount([{...fixture,title:'<img src=x onerror=alert(1)>',description:'<script>alert(1)</script>',discussion_url:'javascript:alert(1)',issue_url:'https://evil.example/issues/1'}]);const grid=app.get('[data-project-grid]');assert.match(text(grid),/<script>/);const walk=n=>[n,...n.children.flatMap(walk)];assert.equal(walk(grid).filter(n=>n.tag==='a').length,0);assert.equal(walk(grid).filter(n=>n.tag==='script'||n.tag==='img').length,0);});
test('sort votes including zero/missing, dates and title',async()=>{const app=await mount([{...fixture,title:'Zulu',votes:null},{...fixture,title:'Beta',votes:0,updated_at:'2026-11-03T00:00:00Z'},{...fixture,title:'Alpha',votes:4}]);const titles=()=>app.get('[data-project-grid]').children.map(card=>card.children.find(n=>n.tag==='h3').textContent);app.get('#project-sort').value='votes';app.get('#project-sort').events.change();assert.deepEqual(titles(),['Alpha','Beta','Zulu']);app.get('#project-sort').value='updated';app.get('#project-sort').events.change();assert.equal(titles()[0],'Beta');app.get('#project-sort').value='title';app.get('#project-sort').events.change();assert.deepEqual(titles(),['Alpha','Beta','Zulu']);});
