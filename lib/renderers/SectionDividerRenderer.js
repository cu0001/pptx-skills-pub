/**
 * SectionDividerRenderer - セクション区切りスライド
 *
 * レイアウト:
 *  - 左半分: テーマprimary色のフルブリードパネル + 大きなセクション番号
 *  - 右半分: セクションタイトル・サブタイトル・区切り線
 *
 * 用途:
 *  - 章や節の切り替えを視覚的に示す
 *  - セクション番号付きの大見出しスライド
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {number|string} content.number    - セクション番号（例: 1, "01", "II"）
 * @param {string}        content.title     - セクションタイトル
 * @param {string}        [content.subtitle] - サブタイトル・補足（省略可）
 * @param {string}        [content.label]   - "SECTION" などのラベル（省略可）
 */

const TextFitCalculator = require('../TextFitCalculator');

function renderSectionDividerSlide(builder, content) {
  const { slide, t, slideW, slideH } = builder.createSlideContext();

  const panelW = slideW * 0.38;

  // --- 左パネル（primary色のフルブリード） ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: panelW, h: slideH,
    fill: { color: t.colors.primary },
    line: { width: 0 },
  });

  // --- セクション番号（半透明で大きく） ---
  const numStr = String(content.number || '1').padStart(2, '0');
  slide.addText(numStr, {
    x: 0, y: 0.5, w: panelW, h: slideH - 1.0,
    fontFace: t.typography.fontTitle,
    fontSize: 120,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
    margin: 0,
    transparency: 15,
  });

  // --- セクションラベル（左パネル下部） ---
  const label = content.label || 'SECTION';
  slide.addText(label, {
    x: 0.15, y: slideH - 0.7, w: panelW - 0.3, h: 0.45,
    fontFace: t.typography.fontBody,
    fontSize: t.typography.sizeSmall,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
    transparency: 35,
  });

  // --- 右エリア ---
  const rightX = panelW + 0.5;
  const rightW = slideW - rightX - 0.4;

  // タイトル上の細いアクセントライン
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: rightX, y: slideH * 0.38 - 0.08, w: 0.5, h: 0.06,
    fill: { color: t.colors.secondary },
    line: { width: 0 },
  });

  // セクションタイトル
  const titleFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.title || '',
    rightW,
    t.typography.sizeTitleLarge,
    'title',
    3
  );

  slide.addText(content.title || '', {
    x: rightX, y: slideH * 0.38, w: rightW, h: 2.2,
    fontFace: t.typography.fontTitle,
    fontSize: Math.min(titleFontSize, t.typography.sizeTitleLarge),
    color: t.colors.text,
    bold: true,
    align: 'left',
    valign: 'middle',
    wrap: true,
    fit: 'shrink',
    margin: 0,
  });

  // サブタイトル
  if (content.subtitle) {
    const subY = slideH * 0.38 + 2.3;
    slide.addText(content.subtitle, {
      x: rightX, y: subY, w: rightW, h: 0.8,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody,
      color: t.colors.textMuted,
      align: 'left',
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
  }

  return slide;
}

module.exports = renderSectionDividerSlide;
