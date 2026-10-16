/** Static and helper checks, not claims of native ChatGPT/Claude execution. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {presentQuestion} from '../scripts/choices.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const card=()=>({id:'base',header:'Home base',question:'What should the workshop unlock?',options:[
 {id:'gear',label:'Starting gear',description:'Unlock a different initial loadout.'},
 {id:'crew',label:'New recruits',description:'Unlock specialists with new abilities.'},
 {id:'routes',label:'New routes',description:'Unlock additional expedition choices.'}]});
for (const host of ['chatgpt','codex','unknown']) {
 test(`${host}: native availability must not cause a Claude payload`,()=>{
  const result=presentQuestion(card(),{host,nativeAvailable:true,nativeCustomInput:true});
  assert.equal(result.mode,'text');assert.equal('payload' in result,false);
  assert.match(result.text,/4\. \*\*Write my own answer\*\*/);
 });
}
test('unspecified host falls back even when native capability flags are set',()=>{
 assert.equal(presentQuestion(card(),{nativeAvailable:true,nativeCustomInput:true}).mode,'text');
});
test('Claude retains explicit native questions with custom-input capability',()=>{
 const result=presentQuestion(card(),{host:'claude',nativeAvailable:true,nativeCustomInput:true});
 assert.equal(result.mode,'native-candidate');assert.equal(result.payload.questions.length,1);
 assert.equal(result.payload.questions[0].options.length,3);
 assert.equal(presentQuestion(card(),{host:'claude',nativeAvailable:true}).mode,'text');
});
test('native routing refuses ambiguous flags and unsupported host identifiers',()=>{
 for(const flag of ['nativeAvailable','nativeCustomInput','textOnly','freeform'])
  assert.throws(()=>presentQuestion(card(),{host:'claude',[flag]:'true'}),/boolean/);
 assert.throws(()=>presentQuestion(card(),{host:'pretend-claude'}),/host/);
});
test('ChatGPT freeform preference stays an ordinary question, without mutating its input',()=>{
 const input=card(),before=structuredClone(input);
 assert.equal(presentQuestion(input,{host:'chatgpt',freeform:true}).text,input.question);
 assert.deepEqual(input,before);
});
test('ChatGPT guidance does not fake local scope, observation, persistence or peer review',()=>{
 const guide=fs.readFileSync(path.join(root,'references/chatgpt.md'),'utf8');
 for(const term of ['conversation planning','unsaved handoff',"sandbox's home",'observer availability unverified','not independent Claude or Gemini reviews','actual dispatch tool'])
  assert.ok(guide.includes(term),term);
 const skill=fs.readFileSync(path.join(root,'SKILL.md'),'utf8');
 assert.match(skill,/references\/chatgpt\.md/);
 const setup=fs.readFileSync(path.join(root,'CHATGPT.md'),'utf8');
 for(const term of ['@gds-superpowers','instruction-only','not installation','--format plugin','--format skill'])
  assert.ok(setup.toLowerCase().includes(term.toLowerCase()),term);
});
