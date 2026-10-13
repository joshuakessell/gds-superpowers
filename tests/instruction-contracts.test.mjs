/** Static authoring contracts, deliberately not labeled model behavior tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pkg=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(pkg,p),'utf8');
test('aliases resolve one sibling and do not unconditionally load the interview',()=>{for(const host of ['claude','codex']){const s=read(`adapters/start-${host}/SKILL.md`);assert.match(s,/\.\.\/gds-superpowers\/SKILL\.md/);assert.match(s,/remaining user text/);assert.match(s,/missing, stop/);assert.doesNotMatch(s,/Read its interview guide before/);if(host==='claude')assert.match(s,/^disable-model-invocation: true$/m);}});
test('coordinator retains provenance, ownership, observer consent and stopping rules',()=>{const s=read('SKILL.md');for(const term of ['source_ref','shown_ref','origin: user','revision','lifecycle helper','actual host receipts','Project manual overrides global auto','separate exact installation approval','human playtest','two repair attempts'])assert.ok(s.includes(term),term);});
test('reusable entry paths contain no personal installation history',()=>{for(const f of ['SKILL.md','references/interview.md','references/task-observer.md','companions/task-observer/SKILL.template.md'])assert.doesNotMatch(read(f),/this user|2026-08-24|August 24, 2026/i,f);assert.match(read('review/USER-PROVENANCE.md'),/August 24, 2026/);});
test('independent child adapters retain their own boundaries',()=>{for(const host of ['claude','codex'])for(const f of fs.readdirSync(path.join(pkg,`adapters/${host}-agents`))){const s=read(`adapters/${host}-agents/${f}`);for(const term of ['absolute authoritative project root','approval reference','allowed files','budget','stop condition','Do not spawn descendants','only when that profile is selected','coordinator owns capture'])assert.ok(s.includes(term),`${f}: ${term}`);assert.equal((s.match(/Do not spawn descendants\./g)||[]).length,0,'the repeated isolated sentence was removed; inline boundary remains');}});
test('fallback is explicitly degraded and behavior evaluations remain unexecuted',()=>{assert.match(read('references/engineering.md'),/Only when it is unavailable/);assert.match(read('references/engineering-fallback.md'),/standalone-degraded/);assert.match(read('evals/COMPRESSION-AB.md'),/not run in Claude or Codex/);});
