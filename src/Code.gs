/**
 * SoftBanto 紹介サイト。Google Apps Script の web アプリとして配る。
 * Google Sites に埋め込めるよう、iframe に入れることを許す (ALLOWALL)。
 */

/** 番頭の画面 (Web アプリ) のリンク。空のあいだは「番頭を開く」ボタンを出さない。 */
var BANTO_URL = '';

var SITE_TITLE = 'SoftBanto（そふと番頭）';

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('index');
  t.config = siteConfig_(e);
  return t.evaluate()
    .setTitle(SITE_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 画面に渡す設定。?slide=N で、プレゼンの N 枚目から開く。
 * <script> の中にそのまま書くので、JSON にしてから「<」を逃がす。
 */
function siteConfig_(e) {
  var p = (e && e.parameter) || {};
  var slide = /^\d{1,2}$/.test(String(p.slide || '')) ? parseInt(p.slide, 10) : 0;
  var url = /^https:\/\/[^\s"'<>]+$/.test(BANTO_URL) ? BANTO_URL : '';
  return JSON.stringify({ slide: slide, bantoUrl: url }).replace(/</g, '\\u003c');
}

/**
 * 部分ファイル (CSS・JS) をそのままの字で取り込む。
 * createHtmlOutputFromFile(...).getContent() は HTML として読み直し、JS の「<」を「&lt;」に変えることがあるので使わない。
 */
function include(name) {
  return HtmlService.createTemplateFromFile(name).getRawContent();
}

/** 焼いた絵 (assets.html の JSON) から、名前の data URL を返す。 */
var ASSETS_ = null;
function asset(name) {
  if (!ASSETS_) ASSETS_ = JSON.parse(HtmlService.createTemplateFromFile('assets').getRawContent());
  var url = ASSETS_[name];
  if (!url) throw new Error('絵が見つかりません: ' + name + ' (npm run bake で焼き直す)');
  return url;
}
