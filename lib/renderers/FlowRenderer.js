/**
 * FlowRenderer - フロー・構造整理スライドの描画
 *
 * レイアウト:
 *  - 上部タイトル
 *  - ステップボックスを矢印でつないだ横方向のフロー（最大5ステップ）
 *  - 各ボックスにラベルと説明
 *
 * 指示文との対応:
 *  「左右または上下の流れで関係性を整理し、接続線や矢印は最小限に抑えてよい」
 */

const TextFitCalculator = require('../TextFitCalculator');
const ThemeEngine = require('../ThemeEngine');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {Array<{label:string, description?:string}>} content.steps - 最大5ステップ
 * @param {string} [content.caption]
 */
function renderFlowSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  // --- フローボックス ---
  const steps = (content.steps || []).slice(0, 5);
  const stepCount = steps.length;
  const arrowW = 0.35;
  const flowY = 1.1;
  const flowH = content.caption ? 3.6 : 4.2;
  const totalArrowW = arrowW * (stepCount - 1);
  const boxW = (slideW - m * 2 - totalArrowW) / stepCount;

  steps.forEach((step, i) => {
    const boxX = m + i * (boxW + arrowW);
    const accentColor = i % 2 === 0 ? t.colors.primary : t.colors.secondary;

    // ボックス背景
    builder.addSurface(slide, { x: boxX, y: flowY, w: boxW, h: flowH });

    // ステップ番号バッジ（上端のカラーバー）
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x: boxX, y: flowY, w: boxW, h: 0.45,
      fill: { color: accentColor },
    });

    // ステップ番号テキスト
    slide.addText(`STEP ${i + 1}`, {
      x: boxX, y: flowY, w: boxW, h: 0.45,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeSmall,
      color: ThemeEngine.getContrastColor(accentColor, t.colors.text, 'FFFFFF'),
      align: 'center',
      valign: 'middle',
      bold: true,
      margin: 0,
    });

    // ステップラベル
    slide.addText(step.label || '', {
      x: boxX + 0.1, y: flowY + 0.5, w: boxW - 0.2, h: 0.8,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeBody,
      color: t.colors.primary,
      align: 'center',
      valign: 'middle',
      bold: true,
      wrap: true,
    });

    // ステップ説明（TextFitCalculatorで最適サイズを計算）
    if (step.description) {
      const descBoxWidth = boxW - 0.1;
      const descHeight = flowH - 1.5;
      
      // 高さから推定される行数を計算
      const lineHeight = t.typography.sizeSmall * 1.5; // 行間を考慮
      const maxLines = Math.floor((descHeight * 72) / lineHeight); // インチをポイントに変換
      
      const fontSize = TextFitCalculator.calculateOptimalFontSize(
        step.description,
        descBoxWidth,
        t.typography.sizeSmall,
        'small',
        maxLines
      );

      slide.addText(step.description, {
        x: boxX + 0.05, y: flowY + 1.35, w: descBoxWidth, h: descHeight,
        fontFace: t.typography.fontBody,
        fontSize: fontSize,
        color: t.colors.textMuted,
        align: 'left',
        valign: 'top',
        wrap: true,
        fit: 'shrink', // PptxGenJSの自動フィット機能を有効化
      });
    }

    // 矢印（最後のステップ以外）
    if (i < stepCount - 1) {
      const arrowX = boxX + boxW + 0.05;
      const arrowMidY = flowY + flowH / 2;

      // 矢印（→ 太字で表記、左側から伸ばして太く）
      slide.addText('→', {
        x: arrowX, y: arrowMidY - 0.2, w: arrowW - 0.1, h: 0.4,
        fontFace: 'Arial',
        fontSize: 20,
        color: t.colors.border || 'CCCCCC',
        bold: true,
        margin: 0,
        align: 'center',
        valign: 'middle',
      });
    }
  });

  // --- 下部キャプション ---
  if (content.caption) {
    builder.addCaption(slide, content.caption, {
      x: m, y: slideH - m * 0.5 - 0.4, w: slideW - m * 2, h: 0.4,
      align: 'center',
    });
  }

  return slide;
}

module.exports = renderFlowSlide;
