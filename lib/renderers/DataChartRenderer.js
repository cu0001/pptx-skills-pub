/**
 * DataRenderer - データ整理スライドの描画
 *
 * レイアウト:
 *  - 上段: 主要KPI数値カード（横並び）
 *  - 中段: チャート（バーまたはライン）
 *  - 下段: 要点・注記テキスト
 *
 * 指示文との対応:
 *  「上段に主要数値、中段にチャート、下段に要点や注記を置いてよい」
 */

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {Array<{label:string, value:string, unit?:string, trend?:string}>} content.kpis - 上段KPIカード（最大4つ）
 * @param {object} content.chart - { data: [], chartTitle: string }
 * @param {string[]} [content.points] - 下段の要点（箇条書き）
 */
function renderDataSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  // --- KPIカード（上段）---
  const kpis = content.kpis || [];
  const kpiCount = Math.min(kpis.length, 4);
  const kpiY = 0.9;
  const kpiH = 1.1;
  const usableW = slideW - m * 2;
  const kpiW = kpiCount > 0 ? (usableW - t.layout.gutterH * (kpiCount - 1)) / kpiCount : 0;

  kpis.slice(0, kpiCount).forEach((kpi, i) => {
    const kpiX = m + i * (kpiW + t.layout.gutterH);

    // カード背景
    builder.addSurface(slide, { x: kpiX, y: kpiY, w: kpiW, h: kpiH });

    // アクセントバー（カード左端）
    builder.addAccentBar(slide, { x: kpiX, y: kpiY, h: kpiH });

    // ラベル
    slide.addText(kpi.label, {
      x: kpiX + t.layout.accentBarWidth + 0.1, y: kpiY + 0.08,
      w: kpiW - t.layout.accentBarWidth - 0.2, h: 0.3,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall - 1,
      color: t.colors.textMuted,
    });

    // 数値
    slide.addText((kpi.value || '') + (kpi.unit ? ` ${kpi.unit}` : ''), {
      x: kpiX + t.layout.accentBarWidth + 0.1, y: kpiY + 0.35,
      w: kpiW - t.layout.accentBarWidth - 0.2, h: 0.55,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeBody + 3,
      color: t.colors.primary,
      bold: true,
      valign: 'middle',
    });

    // トレンド
    if (kpi.trend) {
      slide.addText(kpi.trend, {
        x: kpiX + t.layout.accentBarWidth + 0.1, y: kpiY + 0.82,
        w: kpiW - t.layout.accentBarWidth - 0.2, h: 0.25,
        fontFace: t.typography.fontBody,
        fontSize: t.typography.sizeSmall - 2,
        color: t.colors.secondary,
        bold: true,
      });
    }
  });

  // --- チャート（中段）---
  const chartY = kpiY + kpiH + t.layout.gutterV;
  const chartH = content.points && content.points.length > 0 ? 2.0 : 3.0;

  if (content.chart && content.chart.data) {
    builder.addBarChart(slide, content.chart.data, {
      x: m, y: chartY, w: slideW - m * 2, h: chartH,
    }, content.chart.chartTitle || '');
  }

  // --- 要点（下段）---
  if (content.points && content.points.length > 0) {
    const pointsY = chartY + chartH + t.layout.gutterV;
    const pointsH = slideH - pointsY - m * 0.5;

    builder.addBody(slide, content.points.map(p => ({ text: p })), {
      x: m, y: pointsY, w: slideW - m * 2, h: pointsH,
    }, {
      fontSize: t.typography.sizeBody - 2,
    });
  }

  return slide;
}

module.exports = renderDataSlide;
