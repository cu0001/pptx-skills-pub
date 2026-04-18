/**
 * QuoteRenderer - 引用・メッセージ強調スライドの描画
 *
 * レイアウト:
 *  - テーマ背景色で統一した全面デザイン
 *  - 上下に大きな装飾引用符（テーマのprimary色）
 *  - 中央に大きな引用文
 *  - 下部に発言者・出典（右寄せ）
 *  - オプションで補足コメント（下部キャプション）
 *
 * 用途:
 *  - 印象的な名言・一文を強調
 *  - セクション扉・章区切り
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.quote          - 引用文（1〜3文）
 * @param {string} [content.attribution]  - 発言者 / 出典（省略可）
 * @param {string} [content.context]      - 補足コメント（省略可）
 */
function renderQuoteSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  // --- 背景オーバーレイ（テーマsurface色で薄いパネル） ---
  // ダークテーマは背景をそのまま活かす。ライトテーマは中央にサーフェス帯を追加。
  const isDarkTheme = _isColorDark(t.colors.background);
  if (!isDarkTheme) {
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x: 0, y: 0.6, w: slideW, h: slideH - 1.2,
      fill: { color: t.colors.surface },
      line: { color: t.colors.border, width: 0.5 },
    });
  }

  // --- 上部アクセントバー ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: slideW, h: 0.08,
    fill: { color: t.colors.primary },
  });

  // --- 装飾引用符（開き） ---
  slide.addText('\u201C', {
    x: m, y: 0.55,
    w: 1.2, h: 1.2,
    fontFace: t.typography.fontTitle,
    fontSize: 96,
    color: t.colors.primary,
    bold: true,
    align: 'left',
    valign: 'top',
    margin: 0,
    transparency: 25,
  });

  // --- 引用文本体 ---
  const quoteBoxX = m + 0.5;
  const quoteBoxW = slideW - quoteBoxX - m - 0.3;
  const quoteBoxY = 1.1;
  const quoteBoxH = content.attribution ? 2.5 : 3.2;

  const quoteFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.quote || '',
    quoteBoxW,
    t.typography.sizeTitleMedium,
    'title',
    4
  );

  slide.addText(content.quote || '', {
    x: quoteBoxX, y: quoteBoxY,
    w: quoteBoxW, h: quoteBoxH,
    fontFace: t.typography.fontTitle,
    fontSize: Math.min(quoteFontSize, t.typography.sizeTitleMedium + 2),
    color: t.colors.text,
    bold: false,
    italic: true,
    align: 'left',
    valign: 'middle',
    wrap: true,
    fit: 'shrink',
  });

  // --- 装飾引用符（閉じ） ---
  slide.addText('\u201D', {
    x: slideW - m - 1.2,
    y: quoteBoxY + quoteBoxH - 0.9,
    w: 1.2, h: 1.2,
    fontFace: t.typography.fontTitle,
    fontSize: 96,
    color: t.colors.primary,
    bold: true,
    align: 'right',
    valign: 'bottom',
    margin: 0,
    transparency: 25,
  });

  // --- 区切り線 ---
  const dividerY = quoteBoxY + quoteBoxH + 0.15;
  builder.addDivider(slide, m + 0.5, dividerY, slideW - (m + 0.5) * 2);

  // --- 発言者・出典 ---
  if (content.attribution) {
    slide.addText('— ' + content.attribution, {
      x: m + 0.5, y: dividerY + 0.15,
      w: slideW - (m + 0.5) * 2, h: 0.45,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: t.colors.textMuted,
      bold: false,
      italic: false,
      align: 'right',
      valign: 'middle',
    });
  }

  // --- 補足コメント（下部キャプション） ---
  if (content.context) {
    builder.addCaption(slide, content.context, {
      x: m, y: slideH - m - 0.4,
      w: slideW - m * 2, h: 0.4,
      align: 'center',
    });
  }

  // --- 下部アクセントバー ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: slideH - 0.08, w: slideW, h: 0.08,
    fill: { color: t.colors.primary },
    transparency: 60,
  });

  return slide;
}

/**
 * 色が「暗い」かどうかを簡易判定（#なし6桁HEX）
 * @param {string} hex
 * @returns {boolean}
 */
function _isColorDark(hex) {
  try {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // 相対輝度（YIQ式）
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch {
    return false;
  }
}

module.exports = renderQuoteSlide;
