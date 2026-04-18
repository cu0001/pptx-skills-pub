/**
 * TitleRenderer - タイトルスライドの描画
 *
 * レイアウト:
 *  - 中央上部に大タイトル（テーマのprimaryカラー）
 *  - 中央下部にサブタイトル
 *  - 左右または四隅に装飾的なアクセント
 *  - 右下に発表者・日付情報
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {string} [content.subtitle]
 * @param {string} [content.presenter]
 * @param {string} [content.date]
 */
function renderTitleSlide(builder, content) {
  const { slide, t, m } = builder.createSlideContext();

  // --- 装飾枠（Chalkboard風など、テーマに応じて表示） ---
  if (t.shapes.borderDash !== 'none') {
    builder.addDecorativeFrame(slide, { x: m, y: m, w: 10 - m * 2, h: 5.625 - m * 2 });
  }

  // --- 上部アクセントバー ---
  builder.addTopAccentBar(slide);

  // --- メインタイトル（TextFitCalculatorで最適サイズを計算） ---
  const titleBoxWidth = 10 - (m + 0.2) * 2;
  const titleFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.title,
    titleBoxWidth,
    t.typography.sizeTitleLarge,
    'title',
    2 // 最大2行を想定
  );

  slide.addText(content.title, {
    x: m + 0.2, y: 1.2, w: titleBoxWidth, h: 2.5,
    fontFace: t.typography.fontTitle,
    fontSize: titleFontSize,
    color: t.colors.primary,
    bold: true,
    align: 'center',
    valign: 'middle',
    wrap: true,
    fit: 'shrink', // 自動フィット機能
  });

  // --- サブタイトル（TextFitCalculatorで最適サイズを計算） ---
  if (content.subtitle) {
    const subtitleBoxWidth = 10 - (m + 0.2) * 2;
    const subtitleFontSize = TextFitCalculator.calculateOptimalFontSize(
      content.subtitle,
      subtitleBoxWidth,
      t.typography.sizeTitleMedium - 4,
      'subtitle',
      2 // 最大2行を想定
    );

    slide.addText(content.subtitle, {
      x: m + 0.2, y: 3.5, w: subtitleBoxWidth, h: 0.8,
      fontFace: t.typography.fontBody,
      fontSize: subtitleFontSize,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'middle',
      wrap: true,
      fit: 'shrink', // 自動フィット機能
    });
  }

  // --- 下部区切り線 ---
  builder.addDivider(slide, m + 0.3, 4.5, 10 - (m + 0.3) * 2);

  // --- 発表者・日付 ---
  const infoText = [content.presenter, content.date].filter(Boolean).join('　|　');
  if (infoText) {
    builder.addCaption(slide, infoText, {
      x: m + 0.3, y: 4.7, w: 10 - (m + 0.3) * 2, h: 0.4,
      align: 'center',
    });
  }

  return slide;
}

module.exports = renderTitleSlide;
