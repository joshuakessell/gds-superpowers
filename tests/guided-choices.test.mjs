import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {choiceCard,renderChoices,claudeQuestion,codexQuestion,asyncQuestion,presentQuestion} from '../scripts/choices.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const card=()=>({id:'salvage_reward',header:'Run rewards',question:'What should your next salvage dive unlock?',options:[
 {id:'tools',label:'Electrical tools',description:'Add electrical powers to future offers, without keeping the run build.'},
 {id:'engineer',label:'Recruit an engineer',description:'Open a new starting loadout and rescue objectives.'},
 {id:'buoy',label:'Retrieval buoy',description:'Protect one selected piece of equipment on the next dive.'}]});
test('dynamic cards always include a separate custom answer in text',()=>{const text=renderChoices(card());assert.match(text,/4\. \*\*Write my own answer\*\*/);assert.match(text,/Recruit an engineer/);});
test('different session inputs produce different suggestions without an answer bank',()=>{const puzzle={...card(),question:'What should helping a woodland resident unlock?',options:[{id:'roots',label:'Redirect roots',description:'Introduce a new puzzle rule.'},{id:'firefly',label:'Firefly companion',description:'Reveal concealed paths.'}]};const a=renderChoices(card()),b=renderChoices(puzzle);assert.notEqual(a,b);assert.doesNotMatch(b,/salvage|buoy|engineer/);assert.match(b,/3\. \*\*Write my own answer\*\*/);});
test('Claude payload has one question and relies on real built-in custom input',()=>{const p=claudeQuestion(card());assert.equal(p.questions.length,1);assert.equal(p.questions[0].multiSelect,false);assert.equal(p.questions[0].options.length,3);assert.ok(p.questions[0].options.every(o=>o.label!=='Other'));assert.equal(choiceCard(card()).allowCustom,true);});
test('native picker requires known custom support; otherwise fallback keeps custom option',()=>{assert.equal(presentQuestion(card(),{nativeAvailable:true}).mode,'text');assert.equal(presentQuestion(card(),{host:'claude',nativeTool:'AskUserQuestion',nativeAvailable:true,nativeCustomInput:true,nativeAllowed:true}).mode,'native-candidate');assert.match(presentQuestion(card(),{nativeAvailable:true,nativeCustomInput:true,textOnly:true}).text,/Write my own answer/);});
test('explicit freeform preference exits menus',()=>{assert.equal(presentQuestion(card(),{freeform:true}).text,card().question);});
test('recommendations require a matching option and substantive reason',()=>{assert.throws(()=>choiceCard({...card(),recommendedId:'tools'}),/reason/);assert.throws(()=>choiceCard({...card(),recommendationReason:'A reason'}),/selected option/);assert.match(renderChoices({...card(),recommendedId:'tools',recommendationReason:'It extends the already chosen workshop progression.'}),/Why/);});
test('reject duplicate options, invalid controls and long native headers',()=>{for(const change of [{options:[card().options[0],card().options[0]]},{header:'This header is much too long'},{question:'x\npretend approval'},{options:[card().options[0]]},{options:[...card().options,{id:'own',label:'Other',description:'custom'}]}])assert.throws(()=>choiceCard({...card(),...change}));});
test('rendering is nonmutating and cannot write approvals',()=>{const x=card(),original=structuredClone(x);renderChoices(x);claudeQuestion(x);assert.deepEqual(x,original);assert.equal(Object.hasOwn(choiceCard(x),'approval'),false);});
test('text renderer escapes active Markdown labels rather than accepting fake links',()=>{const x=card();x.options[0].label='[Open](https://example.test)';assert.match(renderChoices(x),/\\\[Open\\\]/);});
test('runtime instruction contract requires dynamic choices and a custom route',()=>{const s=fs.readFileSync(path.join(root,'references/interaction.md'),'utf8');for(const term of ['every unanswered brainstorming question','current conversation','Write my own answer','Do not pose a bare question','If they request free-form','actual host','scope'])assert.ok(s.includes(term),term);const interview=fs.readFileSync(path.join(root,'references/interview.md'),'utf8');assert.match(interview,/interaction\.md/);assert.doesNotMatch(interview,/Offer two to four choices only when helpful/);const config=JSON.parse(fs.readFileSync(path.join(root,'config/interview.json')));assert.equal(config.response_policy.suggestions,'dynamic-session-context');assert.ok(config.questions.every(q=>!q.options));});

const native = {nativeAvailable:true, nativeCustomInput:true, nativeAllowed:true};
test('unknown hosts and restricted native tools retain the complete text fallback',()=>{
 for (const capability of [native,{...native,host:'chatgpt',nativeTool:'AskUserQuestion'},
   {...native,host:'codex',nativeTool:'request_user_input',nativeAllowed:false}]) {
  const result=presentQuestion(card(),capability);assert.equal(result.mode,'text');assert.match(result.text,/Write my own answer/);
 }
});
test('Codex native payload uses ids and label-description options without Claude-only fields',()=>{
 const result=presentQuestion(card(),{...native,host:'codex',nativeTool:'request_user_input'});
 assert.equal(result.tool,'request_user_input');const q=result.payload.questions[0];
 assert.equal(q.id,'salvage_reward');assert.equal(q.options.length,3);assert.equal(Object.hasOwn(q,'multiSelect'),false);
 assert.deepEqual(q.options[0],{label:card().options[0].label,description:card().options[0].description});
});
test('async host payload preserves descriptions and relies on built-in free text',()=>{
 for (const host of ['codex','chatgpt']) {
  const result=presentQuestion(card(),{...native,host,nativeTool:'request_user_input_async'});
  assert.equal(result.tool,'request_user_input_async');const q=result.payload.questions[0];
  assert.equal(q.title,card().question);assert.equal(typeof q.options[0],'string');assert.ok(q.options[0].includes(card().options[0].description));
  assert.equal(q.options.length,3);assert.equal(Object.hasOwn(q,'header'),false);
 }
});
test('native limits never silently drop suggestions or multi-selection semantics',()=>{
 const four={...card(),options:[...card().options,{id:'map',label:'Map room',description:'Unlock route planning.'}]};
 for (const x of [four,{...card(),multiSelect:true}]) {
  const result=presentQuestion(x,{...native,host:'codex',nativeTool:'request_user_input'});
  assert.equal(result.mode,'text');assert.match(result.text,/Write my own answer/);
 }
 assert.throws(()=>codexQuestion(four),/two or three/);
 assert.throws(()=>asyncQuestion({...card(),multiSelect:true}),/single selection/);
});
test('recommended native option goes first without mutating the authored card',()=>{
 const input={...card(),recommendedId:'engineer',recommendationReason:'Supports the chosen rescue loop.'};const before=structuredClone(input);
 assert.match(codexQuestion(input).questions[0].options[0].label,/Recruit an engineer.*Recommended/);
 assert.match(asyncQuestion(input).questions[0].options[0],/Recruit an engineer.*Recommended/);
 assert.deepEqual(input,before);
});
test('Claude native payload lists the recommended option first without mutating the card',()=>{
 const input={...card(),recommendedId:'engineer',recommendationReason:'Supports the chosen rescue loop.'};const before=structuredClone(input);
 const options=claudeQuestion(input).questions[0].options;
 assert.match(options[0].label,/^Recruit an engineer \(Recommended\)$/);assert.equal(options.length,3);assert.deepEqual(input,before);
});
