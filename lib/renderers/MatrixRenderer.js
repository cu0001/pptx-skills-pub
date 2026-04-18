/**
 * MatrixRenderer - 2×2マトリックススライドの描画
 *
 * レイアウト:
 *  - 上部タイトル
 *  - スライド中央に2本の軸線（X軸・Y軸）で4象限を形成
 *  - 各象限に: 見出しラベル + アイテムリスト
 *  - 軸端にラベル（低/高）
 *
 * 用途:
 *  - 戦略評価（コスト vs インパクト）
 *  - 優先度整理（緊急度 vs 重要度）
 *  - SWOT分析（強み / 弱み / 機会 / 脅威）
 */

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {{ low:string, high:string }} content.axisX  - X軸（横）のラベル
 * @param {{ low:string, high:string }} content.axisY  - Y軸（縦）のラベル
 * @param {Array<{ label:string, items?:string[] }>} content.quadrants
 *   - 象限の順序: [左上, 右上, 左下, 右下]
 */
function renderMatrixSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  // --- マトリックスエリアの定義 ---
  const axisLabelH = 0.3;  // 軸ラベルの高さ
  const matrixY = 0.95;
  const matrixH = slideH - matrixY - axisLabelH - m * 0.5;
  const matrixX = m + axisLabelH; // Y軸ラベル分だけ右にオフセット
  const matrixW = slideW - matrixX - m;

  const midX = matrixX + matrixW / 2;
  const midY = matrixY + matrixH / 2;

  // 象限の定義（左上/右上/左下/右下）
  const quadrants = (content.quadrants || []).slice(0, 4);
  while (quadrants.length < 4) quadrants.push({ label: '', items: [] });

  // 象限ごとの色（テーマカラーを薄く）
  const quadColors = [
    t.colors.surface,   // 左上
    t.colors.surface,   // 右上
    t.colors.surface,   // 左下
    t.colors.surface,   // 右下
  ];
  const quadLabelColors = [
    t.colors.primary,    // 左上
    t.colors.secondary,  // 右上
    t.colors.secondary,  // 左下
    t.colors.textMuted,  // 右下
  ];

  const pad = 0.12;
  const quadDefs = [
    { x: matrixX, y: matrixY, w: matrixW / 2, h: matrixH / 2 },             // 左上
    { x: midX,    y: matrixY, w: matrixW / 2, h: matrixH / 2 },             // 右上
    { x: matrixX, y: midY,    w: matrixW / 2, h: matrixH / 2 },             // 左下
    { x: midX,    y: midY,    w: matrixW / 2, h: matrixH / 2 },             // 右下
  ];

  // --- 各象限の描画 ---
  quadDefs.forEach((q, i) => {
    // 象限背景
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x: q.x + 0.02, y: q.y + 0.02,
      w: q.w - 0.04, h: q.h - 0.04,
      fill: { color: quadColors[i] },
      line: { color: t.colors.border, width: 0.3 },
    });

    const quad = quadrants[i];

    // 象限見出しラベル
    if (quad.label) {
      slide.addText(quad.label, {
        x: q.x + pad, y: q.y + pad * 0.5,
        w: q.w - pad * 2, h: 0.38,
        fontFace: t.typography.fontTitle,
        fontSize: t.typography.sizeBody - 1,
        color: quadLabelColors[i],
        bold: true,
        valign: 'middle',
        margin: 0,
        wrap: true,
      });
    }

    // アイテムリスト
    if (quad.items && quad.items.length > 0) {
      const itemsText = quad.items.map((item, j) => ({
        text: item,
        options: {
          bullet: true,
          fontSize: t.typography.sizeSmall,
          color: t.colors.text,
          breakLine: j < quad.items.length - 1,
        },
      }));
      slide.addText(itemsText, {
        x: q.x + pad, y: q.y + 0.42,
        w: q.w - pad * 2, h: q.h - 0.42 - pad * 0.5,
        fontFace: t.typography.fontBody,
        fontSize: t.typography.sizeSmall,
        color: t.colors.text,
        valign: 'top',
        wrap: true,
        fit: 'shrink',
      });
    }
  });

  // --- 十字軸線 ---
  // 縦軸線
  slide.addShape(builder.pres.shapes.LINE, {
    x: midX, y: matrixY, w: 0, h: matrixH,
    line: { color: t.colors.border, width: 1.5 },
  });
  // 横軸線
  slide.addShape(builder.pres.shapes.LINE, {
    x: matrixX, y: midY, w: matrixW, h: 0,
    line: { color: t.colors.border, width: 1.5 },
  });

  // --- 軸ラベル（X軸：左端・右端） ---
  const axisY = matrixY + matrixH + 0.06;
  if (content.axisX) {
    // X軸 低（左）
    slide.addText(content.axisX.low || '', {
      x: matrixX, y: axisY, w: matrixW / 2, h: axisLabelH * 0.8,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall - 1,
      color: t.colors.textMuted,
      align: 'left',
      valign: 'middle',
      italic: true,
    });
    // X軸 高（右）
    slide.addText(content.axisX.high || '', {
      x: midX, y: axisY, w: matrixW / 2, h: axisLabelH * 0.8,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall - 1,
      color: t.colors.textMuted,
      align: 'right',
      valign: 'middle',
      italic: true,
    });
  }

  // --- 軸ラベル（Y軸：縦テキスト） ---
  if (content.axisY) {
    // Y軸 高（上端）
    slide.addText(content.axisY.high || '', {
      x: m, y: matrixY, w: axisLabelH, h: matrixH / 2,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall - 1,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'top',
      italic: true,
      vert: 'eaVert',
    });
    // Y軸 低（下端）
    slide.addText(content.axisY.low || '', {
      x: m, y: midY, w: axisLabelH, h: matrixH / 2,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall - 1,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'bottom',
      italic: true,
      vert: 'eaVert',
    });
  }

  return slide;
}

module.exports = renderMatrixSlide;
