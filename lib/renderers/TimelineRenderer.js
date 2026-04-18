/**
 * TimelineRenderer - 沿革・ロードマップの描画
 *
 * レイアウト:
 *  - 中央を横断するタイムラインの線とノード（ドット）
 *  - ノードの上下に交互に配置される情報ボックス
 * 
 * content:
 *  - title: スライドタイトル
 *  - timeline: 配列 [{ period: "2024年Q1", title: "フェーズ1", description: "要件定義とプロトタイプ作成" }, ...]
 */

const TextFitCalculator = require('../TextFitCalculator');

function renderTimelineSlide(builder, content) {
  const { slide, t, m, slideW } = builder.createSlideContext();

  // タイトル
  builder.addTitle(slide, content.title || 'Timeline', { x: 0.5, y: 0.3, w: 9.0, h: 0.6 }, 'large');
  const items = content.timeline || [];
  const itemCount = items.length || 1;
  
  // 左右1インチずつ余白をとる
  const startX = 1.0;
  const endX = slideW - 1.0;
  const stepX = itemCount > 1 ? (endX - startX) / (itemCount - 1) : 0;
  
  const lineY = 3.2; // タイムラインの基準Y座標
  
  // ベースとなる横線
  slide.addShape(builder.pres.shapes.LINE, {
    x: startX - 0.2, y: lineY, w: (endX - startX) + 0.4, h: 0,
    line: { color: t.colors.border, width: 2 }
  });
  
  const boxW = Math.min(2.0, (slideW - 2.0) / itemCount * 0.9); // 最大幅2.0

  items.forEach((item, index) => {
    const cx = itemCount === 1 ? slideW / 2 : startX + (stepX * index);
    const isTop = index % 2 === 0;
    
    // ドット
    slide.addShape(builder.pres.shapes.OVAL, {
      x: cx - 0.1, y: lineY - 0.1, w: 0.2, h: 0.2,
      fill: { color: t.colors.primary }
    });
    
    // 時期テキスト
    slide.addText(item.period || '', {
      x: cx - boxW/2, y: isTop ? lineY - 0.4 : lineY + 0.2, w: boxW, h: 0.3,
      fontFace: t.typography.fontTitle, fontSize: t.typography.sizeSmall,
      color: t.colors.primary, bold: true, align: 'center', valign: 'middle'
    });

    // ボックス
    const boxY = isTop ? lineY - 1.9 : lineY + 0.6;
    const boxH = 1.1;
    builder.addSurface(slide, { x: cx - boxW/2, y: boxY, w: boxW, h: boxH });

    // タイトル (ボックス内)
    slide.addText(item.title || '', {
      x: cx - boxW/2 + 0.1, y: boxY + 0.1, w: boxW - 0.2, h: 0.3,
      fontFace: t.typography.fontTitle, fontSize: t.typography.sizeBody,
      color: t.colors.text, bold: true, align: 'center', valign: 'middle', wrap:true, fit: 'shrink'
    });

    // 説明文 (ボックス内)
    slide.addText(item.description || '', {
      x: cx - boxW/2 + 0.1, y: boxY + 0.4, w: boxW - 0.2, h: boxH - 0.5,
      fontFace: t.typography.fontBody, fontSize: t.typography.sizeSmall - 1, 
      color: t.colors.textMuted, align: 'center', valign: 'top', wrap:true, fit: 'shrink'
    });
    
    // 接続線 (点線)
    const connectYBase = isTop ? lineY - 0.1 : lineY + 0.1;
    const connectYBox = isTop ? boxY + boxH : boxY;
    slide.addShape(builder.pres.shapes.LINE, {
      x: cx, y: isTop ? connectYBox : connectYBase, 
      w: 0, h: isTop ? connectYBase - connectYBox : connectYBox - connectYBase,
      line: { color: t.colors.border, width: 1, dashType: 'dash' }
    });
  });
  
  return slide;
}

module.exports = renderTimelineSlide;
