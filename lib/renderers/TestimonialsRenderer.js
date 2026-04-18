/**
 * TestimonialsRenderer - 推薦コメント（お客様の声）スライド
 *
 * レイアウト:
 *  - 上部タイトル
 *  - 1〜3枚の推薦コメントカードを横並び
 *  - 各カード: 引用符デコレーション + コメント本文 + 発言者名・役職
 *  - カード下部にアバター代替のイニシャルバッジ
 *
 * 用途:
 *  - 顧客・ユーザーの声
 *  - 社内ステークホルダーのコメント
 *  - 推薦文・評価の紹介
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {Array<{quote:string, name:string, role?:string, organization?:string}>} content.testimonials
 *   - 最大3件
 * @param {string} [content.caption]
 */

const TextFitCalculator = require('../TextFitCalculator');
const { computeRow } = require('../LayoutCalculator');

function renderTestimonialsSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  const testimonials = (content.testimonials || []).slice(0, 3);
  const count = testimonials.length;
  if (count === 0) return slide;

  const cardY = 1.05;
  const cardH = (content.caption ? slideH - 0.55 : slideH - m * 0.3) - cardY;

  const cards = computeRow(count, {
    gutter: t.layout.gutterH,
    cardY,
    cardH,
    marginH: m,
  });

  const accentColors = [t.colors.primary, t.colors.secondary, t.colors.primary];

  testimonials.forEach((item, i) => {
    const { x, y, w, h } = cards[i];
    const accent = accentColors[i % accentColors.length];

    // カード背景
    builder.addSurface(slide, { x, y, w, h });

    // 上端アクセントライン
    slide.addShape(builder.pres.shapes.RECTANGLE, {
      x, y, w, h: 0.05,
      fill: { color: accent },
      line: { width: 0 },
    });

    // 装飾引用符（開き）
    slide.addText('\u201C', {
      x: x + 0.12, y: y + 0.08, w: 0.6, h: 0.6,
      fontFace: t.typography.fontTitle,
      fontSize: 44,
      color: accent,
      bold: true,
      align: 'left',
      valign: 'top',
      margin: 0,
      transparency: 20,
    });

    // 発言者イニシャルバッジ（下部）
    const badgeSize = 0.5;
    const badgeX = x + (w - badgeSize) / 2;
    const badgeY = y + h - badgeSize - 0.35;

    slide.addShape(builder.pres.shapes.OVAL, {
      x: badgeX, y: badgeY, w: badgeSize, h: badgeSize,
      fill: { color: accent, transparency: 20 },
      line: { width: 0 },
    });

    const initials = (item.name || '?')
      .split(/[\s　]+/)
      .map(s => s[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();

    slide.addText(initials, {
      x: badgeX, y: badgeY, w: badgeSize, h: badgeSize,
      fontFace: t.typography.fontTitle,
      fontSize: 13,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });

    // 名前
    slide.addText(item.name || '', {
      x: x + 0.1, y: badgeY + badgeSize + 0.06, w: w - 0.2, h: 0.28,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeSmall + 1,
      color: t.colors.text,
      bold: true,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });

    // 役職・組織
    const roleOrg = [item.role, item.organization].filter(Boolean).join(' / ');
    if (roleOrg) {
      slide.addText(roleOrg, {
        x: x + 0.1, y: badgeY + badgeSize + 0.34, w: w - 0.2, h: 0.22,
        fontFace: t.typography.fontBody,
        fontSize: t.typography.sizeSmall - 1,
        color: t.colors.textMuted,
        italic: true,
        align: 'center',
        valign: 'middle',
        margin: 0,
        wrap: true,
      });
    }

    // コメント本文
    const quoteAreaY = y + 0.6;
    const quoteAreaH = badgeY - quoteAreaY - 0.1;

    const quoteFontSize = TextFitCalculator.calculateOptimalFontSize(
      item.quote || '',
      w - 0.3,
      t.typography.sizeBody - 1,
      'body',
      Math.max(3, Math.floor(quoteAreaH / 0.28))
    );

    slide.addText(item.quote || '', {
      x: x + 0.15, y: quoteAreaY, w: w - 0.3, h: quoteAreaH,
      fontFace: t.typography.fontBody,
      fontSize: Math.min(quoteFontSize, t.typography.sizeBody - 1),
      color: t.colors.text,
      italic: true,
      align: 'left',
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
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

module.exports = renderTestimonialsSlide;
