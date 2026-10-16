#!/usr/bin/env node
/** Read an agent-authored card from stdin and emit the complete text fallback. */
import {renderChoices} from './choices.mjs';

let idle;
try {
  if (process.argv.length !== 2) throw Error('Usage: node render-choices.mjs < card.json');
  if (process.stdin.isTTY) throw Error('Provide a JSON card on stdin; interactive input is unsupported');
  process.stdin.setEncoding('utf8');
  let input = '';
  const resetTimeout = () => {
    clearTimeout(idle);
    idle = setTimeout(() => process.stdin.destroy(new Error('stdin timed out; provide JSON and close stdin')), 2000);
  };
  resetTimeout();
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 16384) throw Error('JSON card exceeds 16384 characters');
    resetTimeout();
  }
  const card = JSON.parse(input);
  process.stdout.write(renderChoices(card) + '\n');
} catch (error) {
  console.error(`Choice rendering refused: ${error.message}`);
  process.exitCode = 1;
} finally {
  clearTimeout(idle);
}
