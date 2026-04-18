/**
 * ComparisonRenderer - 比較表スライドの描画
 *
 * レイアウト:
 *  - 上部に比較テーマタイトル
 *  - 中央に比較表（ColA vs ColB）
 *  - 下部に短い示唆・まとめ
 *
 * 指示文との対応:
 *  「上部に比較テーマ、中央に比較表、下部に短い示唆を置いてよい」
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {string} content.labelA - 左列見出し
 * @param {string} content.labelB - 右列見出し
 * @param {Array<{rowLabel:string, a:string, b:string}>} content.rows
 * @param {string} [content.insight] - 下部の示唆文
 */
function renderComparisonSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide, t.colors.secondary);
  builder.addSlideTitle(slide, content.title);

  // --- 比較表 ---
  const tableY = 1.0;
  const tableH = content.insight ? 3.6 : 4.2;

  // ヘッダー行
  const headerRow = [
    { text: '', options: { fill: { color: t.colors.surface }, bold: true } },
    { text: content.labelA, options: { fill: { color: t.colors.primary }, color: 'FFFFFF', bold: true, align: 'center' } },
    { text: content.labelB, options: { fill: { color: t.colors.secondary }, color: 'FFFFFF', bold: true, align: 'center' } },
  ];

  // データ行（自動文字サイズ調整機能付き）
  const dataRows = (content.rows || []).map((row, i) => {
    const rowBg = i % 2 === 0 ? t.colors.surface : t.colors.background;
    return [
      { text: row.rowLabel, options: { fill: { color: rowBg }, bold: true, color: t.colors.text, fontFace: t.typography.fontBody } },
      { text: row.a, options: { fill: { color: rowBg }, color: t.colors.text, align: 'center', fontFace: t.typography.fontBody } },
      { text: row.b, options: { fill: { color: rowBg }, color: t.colors.text, align: 'center', fontFace: t.typography.fontBody } },
    ];
  });

  // TextFitCalculatorで最適なフォントサイズを計算
  const tableMargin = m * 0.85;
  const tableWidth = slideW - tableMargin * 2;
  const colWidths = [tableWidth * 0.24, tableWidth * 0.38, tableWidth * 0.38];
  
  // 各列の最長テキストを取得
  const allTexts = (content.rows || []).flatMap(row => [row.rowLabel, row.a, row.b]);
  const longestText = allTexts.reduce((longest, current) =>
    current.length > longest.length ? current : longest, ''
  );
  
  // 最も狭い列（データ列）の幅を基準に計算
  const narrowestColWidth = Math.min(...colWidths.slice(1)); // データ列のみ
  
  const tableFontSize = TextFitCalculator.calculateOptimalFontSize(
    longestText,
    narrowestColWidth,
    t.typography.sizeBody,
    'body',
    1 // 1セルあたり1行を想定
  );
  
  slide.addTable([headerRow, ...dataRows], {
    x: tableMargin, y: tableY, w: tableWidth,
    colW: colWidths,
    border: { pt: 0.5, color: t.colors.border },
    fontSize: tableFontSize -1,
    fontFace: t.typography.fontBody,
    color: t.colors.text,
    autoPage: false,
    fit: 'shrink', // 自動フィット機能を有効化
  });

  // --- 下部のインサイト ---
  if (content.insight) {
    builder.addAccentBar(slide, { x: m, y: tableY + tableH + 0.2, h: 0.55 });
    slide.addText(content.insight, {
      x: m + t.layout.accentBarWidth + 0.15,
      y: tableY + tableH + 0.2,
      w: slideW - m * 2 - t.layout.accentBarWidth - 0.15,
      h: 0.55,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: t.colors.text,
      italic: true,
      valign: 'middle',
    });
  }

  return slide;
}

module.exports = renderComparisonSlide;
