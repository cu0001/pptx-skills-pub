/**
 * OverviewRenderer - 概要スライドの描画
 *
 * レイアウト:
 *  - 上部にスライドタイトル（横幅全体）
 *  - 左側（幅40%）: 大きな要点見出し or キーワード
 *  - 右側（幅55%）: 要約文・箇条書き補足
 *  - 左右の境界に縦の区切り線
 *
 * 指示文との対応:
 *  「左に大きな要点見出し、右に要約文や補足データを置いてよい」
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title - スライド上部タイトル
 * @param {string} content.mainKeyword - 左側の大きな要点見出し（1〜3語）
 * @param {string} [content.keywordSub] - 要点見出しの下の補足（短め）
 * @param {Array<{text:string, bold?:boolean}>} content.summaryItems - 右側の箇条書き
 * @param {string} [content.caption] - 右側下部の注記
 */
function renderOverviewSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();
  const titleH  = 0.85;
  const contentY = titleH + t.layout.gutterV;
  const contentH = slideH - contentY - m;

  const leftW  = 3.6; // 3.8 → 3.6 に縮小
  const rightX = m + leftW + t.layout.gutterH * 0.8; // ガター幅を20%縮小
  const rightW = slideW - rightX - m * 0.9; // 右マージンを10%縮小して幅を広げる

  // --- 上部タイトルエリア ---
  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  // タイトル下の仕切り線
  builder.addDivider(slide, m, titleH + 0.05, slideW - m * 2);

  // --- 左エリア: 大見出し（キーワード） ---
  builder.addTitle(slide, content.mainKeyword, {
    x: m, y: contentY, w: leftW, h: contentH * 0.6,
    align: 'center', valign: 'middle',
  }, 'large');

  if (content.keywordSub) {
    slide.addText(content.keywordSub, {
      x: m, y: contentY + contentH * 0.6, w: leftW, h: contentH * 0.4,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 2,
      color: t.colors.secondary,
      align: 'center',
      valign: 'top',
      italic: true,
    });
  }

  // 左右の縦区切り線
  slide.addShape(builder.pres.shapes.LINE, {
    x: m + leftW + t.layout.gutterH / 2,
    y: contentY,
    w: 0,
    h: contentH,
    line: { color: t.colors.border, width: 1 },
  });

  // --- 右エリア: 要約・箇条書き（TextFitCalculatorで最適サイズを計算） ---
  // 項目間にスペース行を挿入
  const summaryItems = content.summaryItems || [];
  const itemsWithBullet = [];
  summaryItems.forEach((item, index) => {
    itemsWithBullet.push({
      ...item,
      bullet: true,
    });
    // 最後の項目以外の後にスペース行を追加
    if (index < summaryItems.length - 1) {
      itemsWithBullet.push({
        text: '',
        bullet: false,
      });
    }
  });

  // 最も長い項目を基準に計算
  const longestItem = summaryItems.length > 0
    ? summaryItems.reduce((longest, current) =>
        current.text.length > longest.text.length ? current : longest)
    : { text: '' };
  
  const fontSizeOverride = TextFitCalculator.calculateOptimalFontSize(
    longestItem.text,
    rightW,
    t.typography.sizeBody,
    'body',
    1 // 1項目あたり1行を想定
  );
  
  builder.addBody(slide, itemsWithBullet, {
    x: rightX, y: contentY, w: rightW, h: content.caption ? contentH - 0.5 : contentH,
  }, {
    fontSize: fontSizeOverride,
    fit: 'shrink', // PptxGenJSの自動フィット機能を有効化
  });

  // 注記
  if (content.caption) {
    builder.addCaption(slide, content.caption, {
      x: rightX, y: slideH - m - 0.4, w: rightW, h: 0.4,
    });
  }

  return slide;
}

module.exports = renderOverviewSlide;
