/**
 * IseShowroomDataRenderer - ISE Showroom データ/KPIスライドの描画
 *
 * レイアウト:
 *  - 上部タイトル（24-32pt）
 *  - 複数の数値カード（"00%"形式）
 *  - グリッドレイアウト（2x2、3x1、または4x1）
 *  - 下部に補足テキスト（オプション）
 *
 * XMLからの座標変換:
 *  - タイトル: 上部、24-32pt
 *  - KPIカード: グリッド配置、大きな数値表示
 *  - 補足テキスト: 下部、14-18pt
 */

const TextFitCalculator = require('../TextFitCalculator');
const { computeCards } = require('../LayoutCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title - スライドタイトル
 * @param {Array<{label:string, value:string, unit?:string}>} content.kpis - KPIデータ（最大4つ）
 * @param {string} [content.footnote] - 下部の補足テキスト（オプション）
 */
function renderKpiSlide(builder, content) {
  const { slide, t, slideW, slideH } = builder.createSlideContext();

  const ibmBlue = t.colors.primary;

  // --- タイトル ---
  const titleY = 0.3;
  const titleH = 0.7;
  
  const titleFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.title,
    slideW - 1.0,
    28,
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
    align: 'left',
    valign: 'top',
    wrap: true,
    fit: 'shrink',
  });

  // --- KPIカード ---
  const kpis = content.kpis || [];
  const kpiCount = Math.min(kpis.length, 4);
  
  if (kpiCount === 0) {
    return slide;
  }

  // レイアウト計算: count≤3 は 1行横並び、count=4 は 2×2
  const kpiAreaH = content.footnote ? 3.5 : 4.0;
  const cards = computeCards(kpiCount, {
    margin: t.layout.margin,
    gutterH: t.layout.gutterH,
    gutterV: t.layout.gutterV,
    titleAreaH: 1.2,
    slideH: 1.2 + kpiAreaH + 0.5,
    maxCols: kpiCount <= 3 ? kpiCount : 2,
  });

  kpis.slice(0, kpiCount).forEach((kpi, i) => {
    const { x: kpiX, y: kpiY, w: kpiW, h: kpiH } = cards[i];

    // カード背景
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x: kpiX,
      y: kpiY,
      w: kpiW,
      h: kpiH,
      fill: { color: t.colors.surface },
      line: { color: ibmBlue, width: 1 },
    });

    // ラベル
    slide.addText(kpi.label, {
      x: kpiX + 0.1,
      y: kpiY + 0.1,
      w: kpiW - 0.2,
      h: 0.35,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall +4,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'top',
    });

    // 数値（大きく表示）
    const valueText = (kpi.value || '00') + (kpi.unit || '%');
    const valueFontSize = Math.min(
      TextFitCalculator.calculateOptimalFontSize(valueText, kpiW - 0.4, 48, 'title', 1),
      48
    );

    slide.addText(valueText, {
      x: kpiX + 0.2,
      y: kpiY + 0.5,
      w: kpiW - 0.4,
      h: kpiH - 0.6,
      fontFace: t.typography.fontTitle,
      fontSize: valueFontSize,
      color: ibmBlue,
      bold: true,
      align: 'center',
      valign: 'middle',
    });
  });

  // --- 補足テキスト ---
  if (content.footnote) {
    const footnoteY = slideH - 0.6;
    const footnoteFontSize = TextFitCalculator.calculateOptimalFontSize(
      content.footnote,
      slideW - 1.0,
      t.typography.sizeSmall,
      'body',
      2 // 最大2行
    );

    slide.addText(content.footnote, {
      x: 0.5,
      y: footnoteY,
      w: slideW - 1.0,
      h: 0.5,
      fontFace: t.typography.fontBody,
      fontSize: footnoteFontSize,
      color: t.colors.textMuted,
      align: 'left',
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
  }

  return slide;
}

module.exports = renderKpiSlide;
