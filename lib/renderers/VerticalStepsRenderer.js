/**
 * VerticalStepsRenderer - 縦並び番号ステップスライド
 *
 * レイアウト:
 *  - 上部タイトル
 *  - 各ステップを縦に積み上げ（最大5ステップ）
 *  - 左側: 番号バッジ（アクセント色の円）＋縦の接続線
 *  - 右側: ステップタイトル＋説明文
 *
 * 用途:
 *  - 手順・プロセスの説明（FlowRendererの縦版）
 *  - 時系列ではなく手順を強調したい場合
 *  - 説明文が多く、横並びでは収まらない場合
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {Array<{label:string, description?:string}>} content.steps - 最大5ステップ
 * @param {string} [content.caption]
 */

const TextFitCalculator = require('../TextFitCalculator');

function renderVerticalStepsSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  const steps = (content.steps || []).slice(0, 5);
  const stepCount = steps.length;
  if (stepCount === 0) return slide;

  const areaY = 1.0;
  const areaH = (content.caption ? slideH - 0.55 : slideH - m * 0.4) - areaY;
  const stepH = areaH / stepCount;

  const badgeSize = 0.44;
  const badgeX = m;
  const lineX = badgeX + badgeSize / 2;
  const contentX = badgeX + badgeSize + 0.22;
  const contentW = slideW - contentX - m;

  // 各ステップを交互にaccent色でカラーリング
  const accentColors = [t.colors.primary, t.colors.secondary];

  steps.forEach((step, i) => {
    const stepY = areaY + i * stepH;
    const accent = accentColors[i % accentColors.length];

    // 番号バッジ（円）
    slide.addShape(builder.pres.shapes.OVAL, {
      x: badgeX, y: stepY + (stepH - badgeSize) / 2,
      w: badgeSize, h: badgeSize,
      fill: { color: accent },
      line: { width: 0 },
    });

    slide.addText(String(i + 1), {
      x: badgeX, y: stepY + (stepH - badgeSize) / 2,
      w: badgeSize, h: badgeSize,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeBody + 1,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });

    // 縦の接続線（最後以外）
    if (i < stepCount - 1) {
      const lineTop = stepY + (stepH - badgeSize) / 2 + badgeSize;
      const lineBot = stepY + stepH + (stepH - badgeSize) / 2;
      slide.addShape(builder.pres.shapes.LINE, {
        x: lineX, y: lineTop, w: 0, h: lineBot - lineTop,
        line: { color: t.colors.border, width: 1.5, dashType: 'sysDot' },
      });
    }

    // 右側コンテンツエリア背景
    const contentPadV = stepH > 1.0 ? 0.08 : 0.04;
    builder.addSurface(slide, {
      x: contentX - 0.08, y: stepY + contentPadV,
      w: contentW + 0.08, h: stepH - contentPadV * 2,
    });

    // 左端アクセントバー
    builder.addAccentBar(slide, {
      x: contentX - 0.08,
      y: stepY + contentPadV,
      h: stepH - contentPadV * 2,
    }, accent);

    const innerX = contentX + t.layout.accentBarWidth + 0.1;
    const innerW = contentW - t.layout.accentBarWidth - 0.1;

    // ステップラベル
    const hasDesc = !!step.description;
    const labelH = hasDesc ? Math.max(stepH * 0.38, 0.3) : stepH - contentPadV * 2;

    const labelFontSize = TextFitCalculator.calculateOptimalFontSize(
      step.label || '',
      innerW,
      t.typography.sizeBody + 1,
      'body',
      2
    );

    slide.addText(step.label || '', {
      x: innerX, y: stepY + contentPadV,
      w: innerW, h: labelH,
      fontFace: t.typography.fontTitle,
      fontSize: Math.min(labelFontSize, t.typography.sizeBody + 1),
      color: t.colors.primary,
      bold: true,
      align: 'left',
      valign: 'middle',
      wrap: true,
      fit: 'shrink',
      margin: 0,
    });

    // 説明文
    if (hasDesc) {
      const descY = stepY + contentPadV + labelH;
      const descH = stepH - contentPadV * 2 - labelH;

      const descFontSize = TextFitCalculator.calculateOptimalFontSize(
        step.description,
        innerW,
        t.typography.sizeSmall,
        'small',
        Math.max(2, Math.floor((descH * 72) / (t.typography.sizeSmall * 1.4)))
      );

      slide.addText(step.description, {
        x: innerX, y: descY, w: innerW, h: Math.max(descH, 0.2),
        fontFace: t.typography.fontBody,
        fontSize: Math.min(descFontSize, t.typography.sizeSmall),
        color: t.colors.textMuted,
        align: 'left',
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

module.exports = renderVerticalStepsSlide;
