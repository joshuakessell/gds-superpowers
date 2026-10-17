/** Point HOME at an empty temporary directory so spawned scripts never see personal skills or host config. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'gds-isolated-home-'));
process.env.HOME = home;
delete process.env.CLAUDE_CONFIG_DIR;
delete process.env.CODEX_HOME;
process.on('exit', () => fs.rmSync(home, {recursive: true, force: true}));
