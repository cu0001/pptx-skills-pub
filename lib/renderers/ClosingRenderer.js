/**
 * ClosingRenderer - 締めくくり・エンドスライド
 *
 * レイアウト:
 *  - フルブリード背景（ダークまたはprimary色のオーバーレイ）
 *  - 中央上部にメッセージ（Thank you / ご清聴ありがとうございました 等）
 *  - 下部にお問い合わせ情報・URL・QRコード代替テキスト
 *  - ロゴ代替ブランド名（右上またはフッター）
 *
 * 用途:
 *  - プレゼン最終スライド
 *  - 質疑応答・お問い合わせ促進
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} [content.message]      - メインメッセージ（デフォルト: "ご清聴ありがとうございました"）
 * @param {string} [content.submessage]   - サブメッセージ（省略可）
 * @param {string} [content.name]         - 発表者名（省略可）
 * @param {string} [content.email]        - メールアドレス（省略可）
 * @param {string} [content.url]          - WebサイトURL（省略可）
 * @param {string} [content.organization] - 組織名（省略可）
 */

const TextFitCalculator = require('../TextFitCalculator');

function renderClosingSlide(builder, content) {
  const { slide, t, slideW, slideH } = builder.createSlideContext();

  // --- 上部カラーバー（thin） ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: slideW, h: 0.08,
    fill: { color: t.colors.primary },
    line: { width: 0 },
  });

  // --- 下部フルブリードパネル（primary色、下1/3） ---
  const panelH = slideH * 0.32;
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: slideH - panelH, w: slideW, h: panelH,
    fill: { color: t.colors.primary },
    line: { width: 0 },
  });

  // --- メインメッセージ ---
  const message = content.message || 'ご清聴ありがとうございました';
  const msgFontSize = TextFitCalculator.calculateOptimalFontSize(
    message,
    slideW - 1.6,
    t.typography.sizeTitleLarge,
    'title',
    2
  );

  slide.addText(message, {
    x: 0.8, y: 0.6, w: slideW - 1.6, h: 2.2,
    fontFace: t.typography.fontTitle,
    fontSize: Math.min(msgFontSize, t.typography.sizeTitleLarge),
    color: t.colors.primary,
    bold: true,
    align: 'center',
    valign: 'middle',
    wrap: true,
    fit: 'shrink',
    margin: 0,
  });

  // --- サブメッセージ ---
  if (content.submessage) {
    slide.addText(content.submessage, {
      x: 0.8, y: 2.8, w: slideW - 1.6, h: 0.6,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody,
      color: t.colors.textMuted,
      align: 'center',
      valign: 'middle',
      wrap: true,
      fit: 'shrink',
    });
  }

  // --- 区切り線 ---
  const dividerY = slideH - panelH - 0.06;
  slide.addShape(builder.pres.shapes.LINE, {
    x: slideW * 0.25, y: dividerY, w: slideW * 0.5, h: 0,
    line: { color: t.colors.border, width: 1 },
  });

  // --- 下部パネル内のお問い合わせ情報 ---
  const contactY = slideH - panelH + 0.2;
  const contactH = panelH - 0.4;

  const contactLines = [];
  if (content.name)         contactLines.push(content.name);
  if (content.organization) contactLines.push(content.organization);
  if (content.email)        contactLines.push(content.email);
  if (content.url)          contactLines.push(content.url);

  if (contactLines.length > 0) {
    const contactText = contactLines.map((line, i) => ({
      text: line,
      options: {
        fontSize: i === 0 && content.name ? t.typography.sizeBody + 1 : t.typography.sizeBody - 1,
        bold: i === 0 && content.name,
        color: 'FFFFFF',
        breakLine: i < contactLines.length - 1,
      },
    }));

    slide.addText(contactText, {
      x: 0.8, y: contactY, w: slideW - 1.6, h: contactH,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      wrap: true,
    });
  }

  // --- 下部アクセントバー ---
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: 0, y: slideH - 0.06, w: slideW, h: 0.06,
    fill: { color: t.colors.secondary, transparency: 30 },
    line: { width: 0 },
  });

  return slide;
}

module.exports = renderClosingSlide;
