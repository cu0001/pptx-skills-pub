/**
 * FeatureListRenderer - 特徴やメリットの列挙
 *
 * レイアウト:
 *  - スライド中央に等間隔で横並びに配置されるカード群
 * 
 * content:
 *  - title: スライドタイトル
 *  - features: 配列 [{ title: "機能1", description: "説明..." }, ...] (最大4つ程度を想定)
 */

const TextFitCalculator = require('../TextFitCalculator');
const { computeRow } = require('../LayoutCalculator');

function renderFeatureListSlide(builder, content) {
  const { slide, t, m } = builder.createSlideContext();

  // タイトル
  builder.addTitle(slide, content.title || 'Features', { x: 0.5, y: 0.3, w: 9.0, h: 0.6 }, 'large');
  const features = content.features || [];
  const count = features.length || 1;

  const cards = computeRow(count, { gutter: 0.3, cardY: 1.8, cardH: 2.8, marginH: m + 0.2 });

  features.forEach((feat, index) => {
    const { x: cx, y: cardY, w: cardW, h: cardH } = cards[index];
    
    // 背景カード
    builder.addSurface(slide, { x: cx, y: cardY, w: cardW, h: cardH });
    
    // カード上部のアクセント（バー）
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x: cx, y: cardY, w: cardW, h: 0.1,
      fill: { color: t.colors.secondary || t.colors.primary }
    });
    
    // 見出し
    slide.addText(feat.title || '', {
      x: cx + 0.1, y: cardY + 0.3, w: cardW - 0.2, h: 0.4,
      fontFace: t.typography.fontTitle, fontSize: t.typography.sizeBody + 2,
      color: t.colors.primary, bold: true, align: 'center', valign: 'middle', wrap:true
    });

    // 区切り線
    builder.addDivider(slide, cx + 0.2, cardY + 0.8, cardW - 0.4);

    // 説明文
    slide.addText(feat.description || '', {
      x: cx + 0.1, y: cardY + 1.0, w: cardW - 0.2, h: cardH - 1.2,
      fontFace: t.typography.fontBody, fontSize: t.typography.sizeBody - 1, 
      color: t.colors.text, align: 'left', valign: 'top', wrap:true, fit: 'shrink'
    });
  });
  
  return slide;
}

module.exports = renderFeatureListSlide;
