/**
 * IconGridRenderer - アイコン＋テキストグリッドスライド
 *
 * レイアウト:
 *  - 上部タイトル
 *  - 2〜6枚のカードをグリッド配置（最大3列×2行）
 *  - 各カード: 上部に色付き円＋イニシャル文字、タイトル、説明文
 *
 * 用途:
 *  - 機能・サービス一覧
 *  - 価値提案の列挙
 *  - メリット・特徴のハイライト
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {Array<{icon:string, label:string, description?:string}>} content.items
 *   - icon: 絵文字または1〜2文字のイニシャル（例: "★", "AI", "💡"）
 *   - label: カードタイトル
 *   - description: 説明文（省略可）
 * @param {string} [content.caption]
 */

const TextFitCalculator = require('../TextFitCalculator');
const { computeCards } = require('../LayoutCalculator');

function renderIconGridSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  const items = (content.items || []).slice(0, 6);
  const count = items.length;
  if (count === 0) return slide;

  // 列数の決定: 1-2→1列、3-4→2列、5-6→3列 ... ただし最大3列
  const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);

  const areaY = 1.0;
  const areaH = (content.caption ? slideH - 0.6 : slideH) - areaY - m * 0.5;

  const cards = computeCards(count, {
    margin: m,
    gutterH: t.layout.gutterH,
    gutterV: t.layout.gutterV,
    titleAreaH: areaY,
    slideH: areaY + areaH + m * 0.5,
    maxCols: cols,
  });

  // アクセントカラーのローテーション
  const accentColors = [
    t.colors.primary,
    t.colors.secondary,
    t.colors.primary,
    t.colors.secondary,
    t.colors.primary,
    t.colors.secondary,
  ];

  items.forEach((item, i) => {
    const { x, y, w, h } = cards[i];
    const accent = accentColors[i % accentColors.length];

    // カード背景
    builder.addSurface(slide, { x, y, w, h });

    // 上部カラーバー
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x, y, w, h: 0.06,
      fill: { color: accent },
      line: { width: 0 },
    });

    // アイコン円
    const circleSize = rows === 1 ? 0.7 : 0.55;
    const circleX = x + (w - circleSize) / 2;
    const circleY = y + 0.18;

    slide.addShape(builder.pres.shapes.OVAL, {
      x: circleX, y: circleY, w: circleSize, h: circleSize,
      fill: { color: accent, transparency: 15 },
      line: { width: 0 },
    });

    slide.addText(item.icon || '●', {
      x: circleX, y: circleY, w: circleSize, h: circleSize,
      fontFace: t.typography.fontTitle,
      fontSize: rows === 1 ? 22 : 17,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });

    // ラベル
    const labelY = circleY + circleSize + 0.1;
    const labelFontSize = TextFitCalculator.calculateOptimalFontSize(
      item.label || '',
      w - 0.2,
      t.typography.sizeBody,
      'body',
      2
    );

    slide.addText(item.label || '', {
      x: x + 0.1, y: labelY, w: w - 0.2, h: 0.45,
      fontFace: t.typography.fontTitle,
      fontSize: Math.min(labelFontSize, t.typography.sizeBody + 1),
      color: t.colors.text,
      bold: true,
      align: 'center',
      valign: 'middle',
      wrap: true,
      fit: 'shrink',
    });

    // 説明文
    if (item.description) {
      const descY = labelY + 0.47;
      const descH = h - (descY - y) - 0.1;
      slide.addText(item.description, {
        x: x + 0.1, y: descY, w: w - 0.2, h: Math.max(descH, 0.3),
        fontFace: t.typography.fontBody,
        fontSize: t.typography.sizeSmall,
        color: t.colors.textMuted,
        align: 'center',
        valign: 'top',
        wrap: true,
        fit: 'shrink',
      });
    }
  });

  // キャプション
  if (content.caption) {
    builder.addCaption(slide, content.caption, {
      x: m, y: slideH - m * 0.5 - 0.35, w: slideW - m * 2, h: 0.35,
      align: 'center',
    });
  }

  return slide;
}

module.exports = renderIconGridSlide;
