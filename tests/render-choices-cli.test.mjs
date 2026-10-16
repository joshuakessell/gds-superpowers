import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script = fileURLToPath(new URL('../scripts/render-choices.mjs', import.meta.url));
const run = (input, args = []) => spawnSync(process.execPath, [script, ...args], {input, encoding:'utf8'});
const card = count => ({id:'garden', header:'Garden', question:'How should your rooftop garden expand?',
  options:Array.from({length:count}, (_, i) => ({id:`plot_${i}`, label:`Planting plot ${i + 1}`,
    description:`Connect ${i + 1} neighboring rooftops with a shared planter.`}))});

test('stdin renderer emits every authored choice plus one numbered custom route', () => {
  for (const count of [2,3,4]) {
    const result = run(JSON.stringify(card(count)));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    const rows = result.stdout.split('\n').filter(line => /^\d+\. /.test(line));
    assert.equal(rows.length, count + 1);
    rows.forEach((row, i) => assert.ok(row.startsWith(`${i + 1}. `)));
    assert.match(rows.at(-1), /\*\*Write my own answer\*\*/);
    for (const option of card(count).options) assert.ok(result.stdout.includes(option.description));
  }
});

test('stdin treats shell-looking choice text as data and never executes it', () => {
  const input = card(2); input.options[0].description = 'Keep $(printf injected) and `printf shell` as literal names.';
  const result = run(JSON.stringify(input));
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('$(printf injected)'));
  assert.ok(result.stdout.includes('\\`printf shell\\`'));
});

test('invalid input fails without a partial menu or invented options', () => {
  for (const input of ['', '{', 'null', JSON.stringify(card(1)), JSON.stringify(card(5))]) {
    const result = run(input);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Choice rendering refused/);
  }
  assert.notEqual(run(JSON.stringify(card(2)), ['--unexpected']).status, 0);
});

test('a leading Markdown marker in a question cannot introduce an extra choice', () => {
  for (const prefix of ['- ', '+ ', '2. ', '2) ']) {
    const input = card(2); input.question = prefix + input.question;
    const result = run(JSON.stringify(input));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.split('\n').filter(line => /^\d+[.)] /.test(line)).length, 3);
    assert.ok(!result.stdout.split('\n').some(line => /^[-+] /.test(line)));
  }
});

test('an open pipe without EOF fails promptly instead of hanging the host', async () => {
  const child = spawn(process.execPath, [script]);
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const code = await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => { child.kill(); reject(Error('renderer hung on stdin')); }, 6000);
    child.on('error', error => { clearTimeout(deadline); reject(error); });
    child.on('close', status => { clearTimeout(deadline); resolve(status); });
    child.stdin.write('{'); // Intentionally leave stdin open.
  });
  assert.notEqual(code, 0);
  assert.equal(stdout, '');
  assert.match(stderr, /stdin timed out/);
});
