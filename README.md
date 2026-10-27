# SoftBanto 紹介サイト

SoftBanto（そふと番頭、通称 番頭）を紹介する1枚の頁です。読む頁としても、番頭を説明するときのスライドとしても使えます。
Google Apps Script の web アプリとして配り、Google Sites にもそのまま埋め込めます。

## ファイル

| 場所 | 中身 |
|---|---|
| `src/Code.gs` | `doGet` (頁を返す)・`include` (CSS と JS を取り込む)・`asset` (焼いた絵を返す)・`BANTO_URL` |
| `src/index.html` | 頁のテンプレート (本文・図・アイコン) |
| `src/styles.html` / `src/site.js.html` | CSS と JS の中身。タグは付けない (`index.html` が `<style>` `<script>` で包む) |
| `src/assets.html` | 推しの絵を data URL にした JSON。`npm run bake` が作る。**手で直さない** |
| `src/appsscript.json` | web アプリの設定 (作った人として動く・誰でも見られる) |
| `assets/` | 推しの絵の元 (webp)。最初からいるキャラのタクとイツキ |
| `scripts/bake-assets.mjs` | `assets/` を `src/assets.html` に焼く |
| `scripts/preview.mjs` | テンプレートを埋めた `dist/index.html` を作る (手元で見る用) |

## GAS で配る

最初の一度だけ:

```bash
npm i -g @google/clasp
clasp login
clasp create-script --type webapp --title "SoftBanto 紹介" --rootDir src
```

`.clasp.json` ができます (コミットしない。`.gitignore` 済み)。

直すたびに:

```bash
npm run push                      # 絵を焼いてから clasp push -f
clasp create-deployment -d "初回"  # 初回だけ。出た deploymentId を控える
clasp create-deployment -i <deploymentId> -d "何を変えたか"   # 2回目から。-i を付けないと URL が変わる
```

URL は Apps Script の画面の「デプロイを管理」で見られます (`https://script.google.com/macros/s/…/exec`)。

GAS の web アプリは、頁の上に Google の帯 (「このアプリは Google が作成したものではありません」) が出て、消せません。

## Google Sites に埋め込む

Sites の編集画面で「埋め込む」→「URL で埋め込む」に web アプリの URL を貼ります。
`Code.gs` が `XFrameOptionsMode.ALLOWALL` を付けているので、iframe の中でも開けます。

## 「番頭を開く」ボタン

`src/Code.gs` の先頭の `BANTO_URL` に番頭の画面のリンクを入れて、`npm run push` し直します。

```js
var BANTO_URL = 'https://script.google.com/macros/s/xxxx/exec';
```

空のあいだはボタンを出しません。`https://` で始まらないもの、`<` や空白を含むものも出しません。

## プレゼンモード

| 操作 | 動き |
|---|---|
| 右上の「プレゼン」か `P` | 始める (いま見ている節から) |
| `→` `↓` `Space` `Enter`・画面のクリック | 次へ |
| `←` `↑`・画面の左端 4 分の 1 のクリック | 前へ |
| `Home` / `End` | 最初 / 最後 |
| `Esc` か `P` | 終えて、その節の位置に戻る |

全部で 12 枚です。はじめ・困りごと・全体像・機能ごとに 6 枚・始め方・よくある質問・締め。
機能の枚では、図を中央に大きく出し、字は見出しと 1 行、下に小さな箇条書きだけにします。
目次の札など頁の中のリンクを押すと、その節の枚へ飛びます。

途中の枚から開くには、GAS の URL の末尾に `?slide=3` を付けます。
進めると `google.script.history` で URL の `?slide=` も書き換わります。手元で見るときは `#slide-3` を使います。

## 手元で見る

```bash
npm run preview                    # 絵を焼いて dist/index.html を作る
python3 -m http.server -d dist 8000
# http://localhost:8000/ を開く
```

`BANTO_URL=https://… npm run preview` でボタンが出ます。`SLIDE=3 npm run preview` で、`?slide=3` で開いたときの動きを試せます。

## 動きと、動かないとき

- 頁を開くと、見出しが下から上がり、推しがゆっくり呼吸します。節はスクロールで入り、図の部品は左から順に出ます。ボードの札は上から落ちます。
- OS の「視差効果を減らす」(`prefers-reduced-motion: reduce`) がオンなら、動きもなめらかなスクロールも止めます。
- CDN が読めないときは、動かない形でそのまま全部見えます。書体はシステムの明朝とゴシックに替わります。

## 使った OSS とライセンス

どれも版を固定して読み込みます。アイコンは本文に埋め込み、ほかは CDN から読みます。

| もの | 版 | ライセンス | 使い道 |
|---|---|---|---|
| [GSAP](https://gsap.com/) と ScrollTrigger | 3.12.5 | GSAP Standard License (無償で使える独自のライセンス。MIT ではない) | 入りの演出・図の部品を順に出す |
| [Lenis](https://github.com/darkroomengineering/lenis) | 1.3.26 | MIT | なめらかなスクロール |
| [Lucide](https://lucide.dev/) (lucide-static) | 1.54.0 | ISC | 線のアイコン (`src/index.html` の先頭に埋め込み) |
| [Noto Serif JP](https://fonts.google.com/noto/specimen/Noto+Serif+JP) | Google Fonts | SIL Open Font License 1.1 | 見出し |
| [Zen Kaku Gothic New](https://fonts.google.com/specimen/Zen+Kaku+Gothic+New) | Google Fonts | SIL Open Font License 1.1 | 本文 |
| Lenis の CSS (`lenis.css` の一部) | 1.3.26 | MIT | `src/styles.html` に写した |

推しの絵 (タク・イツキ) は、番頭に最初からいるキャラの絵です。
