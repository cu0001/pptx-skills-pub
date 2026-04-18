/**
 * IseShowroomTitleRenderer - ISE Showroom タイトルスライドの描画
 *
 * レイアウト:
 *  - 中央上部に40ptメインタイトル
 *  - タイトル下に32ptサブタイトル（オプション）
 *  - 右上に青色アクセント長方形
 *  - IBM Blueカラースキーム
 *
 * XMLからの座標変換:
 *  - アクセント長方形: x=9.5", y=0.11", w=2.58", h=0.46"
 *  - タイトル: 中央配置、40pt
 *  - サブタイトル: 中央配置、32pt
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title - メインタイトル（40pt）
 * @param {string} [content.subtitle] - サブタイトル（32pt、オプション）
 */
function renderTitleAccentSlide(builder, content) {
  const { slide, t, slideW, slideH } = builder.createSlideContext();

  const ibmBlue = t.colors.primary;

  // --- 右上アクセント長方形（意図的なスライド右端ブリード: x=9.5, w=2.58） ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 9.5,
    y: 0.11,
    w: 2.58,
    h: 0.46,
    fill: { color: ibmBlue },
    line: { color: ibmBlue, width: 0.5 },
  });

  // --- メインタイトル（36pt） ---
  const titleY = 1.5;
  const titleH = content.subtitle ? 2.0 : 2.5;
  
  const titleFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.title || '',
    slideW - 1.0,
    36,
    'title',
    2 // 最大2行
  );

  slide.addText(content.title || '', {
    x: 0.5,
    y: titleY,
    w: slideW - 1.0,
    h: titleH,
    fontFace: t.typography.fontTitle,
    fontSize: titleFontSize,
    color: t.colors.text,
    bold: true,
    align: 'center',
    valign: 'middle',
    wrap: true,
    fit: 'shrink',
  });

  // --- サブタイトル（24pt、オプション） ---
  if (content.subtitle) {
    const subtitleY = titleY + titleH + 0.2;
    const subtitleFontSize = TextFitCalculator.calculateOptimalFontSize(
      content.subtitle,
      slideW - 1.0,
      24,
      'subtitle',
      2 // 最大2行
    );

    slide.addText(content.subtitle, {
      x: 0.5,
      y: subtitleY,
      w: slideW - 1.0,
      h: 1.0,
      fontFace: t.typography.fontBody,
      fontSize: subtitleFontSize,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'middle',
      wrap: true,
      fit: 'shrink',
    });
  }

  return slide;
}

module.exports = renderTitleAccentSlide;
