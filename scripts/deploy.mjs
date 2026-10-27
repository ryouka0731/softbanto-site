/**
 * 版を差し替える。URL は変えない。
 *
 * `clasp create-deployment` を -i なしで叩くと新しいデプロイができて URL が変わる (配ったリンクが切れる)。
 * この道具は必ず deployment.json の ID に対して差し替える。初回だけは手で
 * `clasp create-deployment -d "初回"` を走らせ、出た ID を deployment.json に書く。
 *
 *   npm run deploy -- "何を変えたか"
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = path.join(ROOT, 'deployment.json');

function deploymentId() {
  if (!fs.existsSync(CONFIG)) {
    throw new Error('deployment.json がありません。`clasp list-deployments` で ID を調べ、{"deploymentId": "..."} で作ってください');
  }
  const id = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).deploymentId;
  if (!id || !/^AKfycb[\w-]{20,}$/.test(id)) throw new Error('deployment.json の deploymentId が読めません: ' + id);
  return id;
}

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
}

const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('使い方: npm run deploy -- "何を変えたか"');
  process.exit(1);
}
const id = deploymentId();
run('node', [path.join(ROOT, 'scripts', 'bake-assets.mjs')]);
run('clasp', ['push', '-f']);
run('clasp', ['create-deployment', '-i', id, '-d', message]);
console.log('\n差し替えました (deploymentId: ' + id + ')。URL は変わっていません');
