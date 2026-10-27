/**
 * assets/*.webp を、GAS に持ち込める形に焼く。
 *
 * GAS は src の外を読めないので、base64 の data URL にして src/assets.html に書く。
 * 中身は「名前 → data URL」の JSON の字だけ (タグもコメントも無い)。Code.gs の asset() が
 * getRawContent() で読んで JSON.parse する。**作ったものは手で直さない。** 絵を足したら npm run bake。
 *
 *   node scripts/bake-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'src', 'assets.html');
const MAX_BYTES = 600 * 1024;

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.webp')).sort();
if (!files.length) throw new Error('assets/ に webp がありません');
const out = {};
for (const f of files) {
  const name = f.replace(/\.webp$/, '');
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('名前に使えない字があります: ' + f);
  out[name] = 'data:image/webp;base64,' + fs.readFileSync(path.join(SRC, f)).toString('base64');
}
const text = JSON.stringify(out);
if (Buffer.byteLength(text) > MAX_BYTES) throw new Error('焼いた絵が大きすぎます (' + Buffer.byteLength(text) + ' バイト)');
fs.writeFileSync(OUT, text);
console.log('焼きました:', path.relative(ROOT, OUT), files.length + ' 枚', Math.round(Buffer.byteLength(text) / 1024) + 'KB');
