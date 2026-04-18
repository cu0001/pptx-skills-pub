/**
 * AgendaRenderer - アジェンダ・目次スライドの描画
 *
 * レイアウト:
 *  - 上部タイトル（「アジェンダ」など）
 *  - 番号付きアジェンダ行を縦に並べる（最大8項目）
 *  - 各行: 左アクセントバー + 番号バッジ + ラベル + 所要時間（省略可）
 *  - activeIndex が指定された行をハイライト（カラーバー強調）
 *
 * 用途:
 *  - 発表冒頭の構成説明
 *  - セクション切り替え時の現在位置表示
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title                         - スライドタイトル（例:「本日のアジェンダ」）
 * @param {Array<{label:string, duration?:string}>} content.items - アジェンダ項目（最大8）
 * @param {number} [content.activeIndex]                 - ハイライトする項目のインデックス（0始まり、省略可）
 */
function renderAgendaSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title || 'アジェンダ');

  // タイトル下の仕切り線
  builder.addDivider(slide, m, 0.88, slideW - m * 2);

  // --- アジェンダ行 ---
  const items = (content.items || []).slice(0, 8);
  const itemCount = items.length;
  const listY = 1.05;
  const listH = slideH - listY - m * 0.8;
  const rowH = listH / Math.max(itemCount, 1);

  // アクティブ列を左右2列に分けるか縦1列にするか（5項目以上なら2列）
  const useTwoColumns = itemCount > 4;
  const colCount = useTwoColumns ? 2 : 1;
  const colW = (slideW - m * 2 - (useTwoColumns ? t.layout.gutterH : 0)) / colCount;

  items.forEach((item, i) => {
    const col = useTwoColumns ? i % 2 : 0;
    const row = useTwoColumns ? Math.floor(i / 2) : i;
    const itemX = m + col * (colW + (useTwoColumns ? t.layout.gutterH : 0));
    const itemY = listY + row * (useTwoColumns ? listH / Math.ceil(itemCount / 2) : rowH);
    const thisRowH = (useTwoColumns ? listH / Math.ceil(itemCount / 2) : rowH) * 0.88;

    const isActive = content.activeIndex === i;

    // 行背景（アクティブのみ）
    if (isActive) {
      slide.addShape(builder.pres.shapes.RECTANGLE, {
        x: itemX, y: itemY + 0.02,
        w: colW, h: thisRowH - 0.04,
        fill: { color: t.colors.surface },
        line: { color: t.colors.primary, width: 0.5 },
      });
    }

    // 左アクセントバー
    const barColor = isActive ? t.colors.primary : t.colors.border;
    builder.addAccentBar(slide, { x: itemX, y: itemY + 0.04, h: thisRowH - 0.08 }, barColor);

    // 番号バッジ（丸）
    const badgeSize = Math.min(thisRowH * 0.6, 0.45);
    const badgeX = itemX + t.layout.accentBarWidth + 0.12;
    const badgeY = itemY + (thisRowH - badgeSize) / 2;
    slide.addShape(builder.pres.shapes.OVAL, {
      x: badgeX, y: badgeY,
      w: badgeSize, h: badgeSize,
      fill: { color: isActive ? t.colors.primary : t.colors.secondary },
    });
    slide.addText(String(i + 1), {
      x: badgeX, y: badgeY,
      w: badgeSize, h: badgeSize,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeSmall,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      bold: true,
      margin: 0,
    });

    // ラベルテキスト
    const labelX = badgeX + badgeSize + 0.12;
    const labelW = colW - (labelX - itemX) - (item.duration ? 1.0 : 0.1);
    const labelFontSize = TextFitCalculator.calculateOptimalFontSize(
      item.label,
      labelW,
      t.typography.sizeBody,
      'body',
      1
    );
    slide.addText(item.label, {
      x: labelX, y: itemY + 0.04,
      w: labelW, h: thisRowH - 0.08,
      fontFace: isActive ? t.typography.fontTitle : t.typography.fontBody,
      fontSize: Math.min(labelFontSize, t.typography.sizeBody + 1),
      color: isActive ? t.colors.primary : t.colors.text,
      bold: isActive,
      valign: 'middle',
      wrap: true,
      fit: 'shrink',
    });

    // 所要時間（右端）
    if (item.duration) {
      slide.addText(item.duration, {
        x: itemX + colW - 1.0, y: itemY + 0.04,
        w: 0.95, h: thisRowH - 0.08,
        fontFace: t.typography.fontBody,
        fontSize: t.typography.sizeSmall,
        color: t.colors.textMuted,
        align: 'right',
        valign: 'middle',
      });
    }
  });

  return slide;
}

module.exports = renderAgendaSlide;
