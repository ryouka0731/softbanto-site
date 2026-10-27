/**
 * 手元で見るための 1 枚の HTML を dist/index.html に作る。
 * GAS のテンプレート (<?!= include('x') ?> / <?!= asset('x') ?> / <?!= config ?>) を、実際の中身に置き換える。
 *
 *   node scripts/preview.mjs            # BANTO_URL=https://... を付けるとボタンも出る
 *   python3 -m http.server -d dist 8000
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const assets = JSON.parse(src('assets.html'));
const config = JSON.stringify({ slide: Number(process.env.SLIDE || 0), bantoUrl: process.env.BANTO_URL || '' });

let html = src('index.html')
  .replace(/<\?!= include\('([a-z.]+)'\) \?>/g, (_, n) => src(n + '.html'))
  .replace(/<\?!= asset\('([a-z0-9-]+)'\) \?>/g, (_, n) => {
    if (!assets[n]) throw new Error('絵が見つかりません: ' + n);
    return assets[n];
  })
  .replace('<?!= config ?>', config)
  // GAS は Code.gs の addMetaTag で付ける
  .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">');
if (html.includes('<?')) throw new Error('置き換えていないテンプレートが残っています');
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), html);
console.log('作りました: dist/index.html', Math.round(html.length / 1024) + 'KB');
