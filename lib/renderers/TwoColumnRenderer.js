/**
 * IseShowroomContentRenderer - ISE Showroom コンテンツスライドの描画
 *
 * レイアウト:
 *  - 上部タイトル（24-32pt、最大5行）
 *  - 左右2カラム分割レイアウト
 *  - 各カラム: セクション見出し（IBM Blue） + 説明文
 *  - IBM Plex Sansフォント使用
 *
 * XMLからの座標変換:
 *  - タイトル: 中央上部、24-32pt
 *  - 左カラム: x=3.33", y=0.82", w=2.48", h=2.48"
 *  - 右カラム: x=6.38", y=0.82", w=2.48", h=2.48"
 */

const TextFitCalculator = require('../TextFitCalculator');

/**
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title - スライドタイトル（24-32pt、最大5行）
 * @param {object} content.leftSection - 左カラムのコンテンツ
 * @param {string} content.leftSection.heading - セクション見出し（IBM Blue）
 * @param {string} content.leftSection.text - 説明文
 * @param {object} [content.rightSection] - 右カラムのコンテンツ（オプション）
 * @param {string} [content.rightSection.heading] - セクション見出し（IBM Blue）
 * @param {string} [content.rightSection.text] - 説明文
 */
function renderTwoColumnSlide(builder, content) {
  const { slide, t, slideW, slideH } = builder.createSlideContext();

  // テーマのPrimaryカラーを使用
  const ibmBlue = t.colors.primary;

  // --- タイトル（24-32pt、最大5行） ---
  const titleY = 0.3;
  const titleH = 0.8;
  
  const titleFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.title,
    slideW - 1.0,
    32,
    'title',
    5 // 最大5行
  );

  slide.addText(content.title || '', {
    x: 0.5,
    y: titleY,
    w: slideW - 1.0,
    h: titleH,
    fontFace: t.typography.fontTitle,
    fontSize: titleFontSize,
    color: t.colors.text,
    bold: true,
    align: 'left',
    valign: 'top',
    wrap: true,
    fit: 'shrink',
  });

  // --- 2カラムレイアウト設定 ---
  const margin = t.layout.margin;
  const gutter = t.layout.gutterH;
  const contentY = titleY + titleH + 0.3;
  const contentH = slideH - contentY - margin;
  const columnW = (slideW - margin * 2 - gutter) / 2;

  // --- 左カラム ---
  const leftX = margin;
  const leftY = contentY;
  const leftW = columnW;
  const leftH = contentH;

  // 左カラム - セクション見出し
  slide.addText(content.leftSection.heading, {
    x: leftX,
    y: leftY,
    w: leftW,
    h: 0.4,
    fontFace: t.typography.fontTitle,
    fontSize: t.typography.sizeBody + 2,
    color: ibmBlue,
    bold: true,
    align: 'left',
    valign: 'top',
  });

  // 左カラム - 説明文
  const leftTextFontSize = TextFitCalculator.calculateOptimalFontSize(
    content.leftSection.text,
    leftW,
    t.typography.sizeBody,
    'body',
    Math.max(1, Math.floor(((leftH - 0.5) * 72) / (t.typography.sizeBody * 1.5)))
  );

  slide.addText(content.leftSection.text, {
    x: leftX,
    y: leftY + 0.5,
    w: leftW,
    h: leftH - 0.5,
    fontFace: t.typography.fontBody,
    fontSize: leftTextFontSize,
    color: t.colors.text,
    align: 'left',
    valign: 'top',
    wrap: true,
    fit: 'shrink',
  });

  // --- 右カラム（オプション） ---
  if (content.rightSection) {
    const rightX = leftX + leftW + gutter;
    const rightY = contentY;
    const rightW = columnW;
    const rightH = contentH;

    // 右カラム - セクション見出し
    slide.addText(content.rightSection.heading, {
      x: rightX,
      y: rightY,
      w: rightW,
      h: 0.4,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeBody + 2,
      color: ibmBlue,
      bold: true,
      align: 'left',
      valign: 'top',
    });

    // 右カラム - 説明文
    const rightTextFontSize = TextFitCalculator.calculateOptimalFontSize(
      content.rightSection.text,
      rightW,
      t.typography.sizeBody,
      'body',
      Math.max(1, Math.floor(((rightH - 0.5) * 72) / (t.typography.sizeBody * 1.5)))
    );

    slide.addText(content.rightSection.text, {
      x: rightX,
      y: rightY + 0.5,
      w: rightW,
      h: rightH - 0.5,
      fontFace: t.typography.fontBody,
      fontSize: rightTextFontSize,
      color: t.colors.text,
      align: 'left',
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
  }

  return slide;
}

module.exports = renderTwoColumnSlide;
