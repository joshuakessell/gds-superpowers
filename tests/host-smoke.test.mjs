import test from 'node:test';
import assert from 'node:assert/strict';
import {hostArgs,sanitizeTrace,CASES} from '../scripts/host-smoke.mjs';
test('host commands never add model or permission overrides',()=>{for(const h of ['claude','codex']){const argv=hostArgs(h,'test');assert.ok(argv.includes('test'));assert.doesNotMatch(argv.join(' '),/bypass|danger-full-access|yolo|acceptEdits|--model/);}});
test('smoke traces omit reasoning blocks and redact obvious secrets',()=>{const line=JSON.stringify({type:'assistant',content:[{type:'thinking',thinking:'private'},{type:'text',text:'fixture /tmp/game sk-1234567890abcdefghijkl and /home/user'}],reasoning:'private',api_key:'secret'});const out=sanitizeTrace(line,'/tmp/game','/home/user');assert.doesNotMatch(out,/private|secret|sk-1234|\/tmp\/game|\/home\/user/);assert.match(out,/<REDACTED>/);assert.match(out,/<FIXTURE>/);});
test('smoke catalog covers the requested live-host boundaries',()=>{for(const key of ['discovery','resume','auto-observer','manual-observer','dispatch','approved-edit','unapproved-scope'])assert.ok(CASES[key]);});
