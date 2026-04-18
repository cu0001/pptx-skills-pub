/**
 * ImageTextRenderer - 画像とテキストの分割レイアウト
 *
 * レイアウト:
 *  - 画面を左右に分割
 *  - 片方に画像、もう片方にタイトルとテキストを配置
 * 
 * content:
 *  - title: スライドタイトル
 *  - text: 説明文
 *  - imagePath: 画像のパス (またはURL)
 *  - imagePosition: 'left' | 'right' (デフォルトは 'right')
 */

const TextFitCalculator = require('../TextFitCalculator');

function renderImageTextSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  const imagePos = content.imagePosition === 'left' ? 'left' : 'right';
  const gutter = 0.4;
  const halfW = (slideW - (m * 2) - gutter) / 2;

  const textX = imagePos === 'right' ? m : m + halfW + gutter;
  const imageX = imagePos === 'right' ? m + halfW + gutter : m;

  // タイトル
  builder.addTitle(slide, content.title || 'Overview', { x: m, y: 0.3, w: slideW - (m * 2), h: 0.6 }, 'large');

  // テキストセクション
  const contentY = 1.2;
  const contentH = slideH - contentY - m;

  slide.addText(content.text, {
    x: textX, y: contentY, w: halfW, h: contentH,
    fontFace: t.typography.fontBody,
    fontSize: t.typography.sizeBody,
    color: t.colors.text,
    valign: 'top',
    wrap: true,
    fit: 'shrink'
  });

  // 画像セクション (プレースホルダ)
  // 実際には builder.pres.addImage を直接引くか、将来的に helper を作る
  if (content.imagePath) {
      slide.addImage({
          path: content.imagePath,
          x: imageX,
          y: contentY,
          w: halfW,
          h: contentH,
          sizing: { type: 'contain' }
      });
  } else {
      // 画像がない場合はダミーの枠を表示
      builder.addSurface(slide, { x: imageX, y: contentY, w: halfW, h: contentH }, { 
          fillColor: t.colors.surface,
          borderColor: t.colors.border,
          line: { dashType: 'dash' }
      });
      slide.addText('Image Placeholder', {
          x: imageX, y: contentY, w: halfW, h: contentH,
          align: 'center', valign: 'middle', color: t.colors.textMuted
      });
  }

  return slide;
}

module.exports = renderImageTextSlide;
