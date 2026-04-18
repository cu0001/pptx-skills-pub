/**
 * TeamRenderer - チーム・人物紹介
 *
 * レイアウト:
 *  - 2〜4人のメンバーを横並びに配置
 *  - 円形（または四角）の画像プレースホルダー、名前、役割、経歴
 * 
 * content:
 *  - title: スライドタイトル
 *  - members: 配列 [{ name: "山田 太郎", role: "プロジェクトリーダー", bio: "経歴...", imagePath? }]
 */

const TextFitCalculator = require('../TextFitCalculator');
const { computeRow } = require('../LayoutCalculator');

function renderTeamSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  // タイトル
  builder.addTitle(slide, content.title || 'Our Team', { x: m, y: 0.3, w: slideW - (m * 2), h: 0.6 }, 'large');

  const members = content.members || [];
  const count = Math.min(members.length, 4); // 最大4名までを想定

  const cards = computeRow(count, {
    gutter: 0.4,
    cardY: 1.3,
    cardH: slideH - 1.3 - m,
    marginH: m + 0.2,
  });

  members.slice(0, 4).forEach((member, index) => {
    const { x: cx, y: contentY, w: cardW } = cards[index];
    const avatarSize = Math.min(cardW * 0.7, 1.2);
    
    // アバター枠 (円形)
    const avatarX = cx + (cardW - avatarSize) / 2;
    const avatarY = contentY;

    if (member.imagePath) {
        slide.addImage({
            path: member.imagePath,
            x: avatarX, y: avatarY, w: avatarSize, h: avatarSize,
            rounding: true
        });
    } else {
        slide.addShape(builder.pres.shapes.OVAL, {
            x: avatarX, y: avatarY, w: avatarSize, h: avatarSize,
            fill: { color: t.colors.surface },
            line: { color: t.colors.border, width: 1 }
        });
        slide.addText('Member', {
            x: avatarX, y: avatarY, w: avatarSize, h: avatarSize,
            align: 'center', valign: 'middle', fontSize: 10, color: t.colors.textMuted
        });
    }

    // 名前
    slide.addText(member.name || '', {
        x: cx, y: avatarY + avatarSize + 0.2, w: cardW, h: 0.3,
        fontFace: t.typography.fontTitle, fontSize: t.typography.sizeBody + 2,
        color: t.colors.primary, bold: true, align: 'center'
    });

    // 役割
    slide.addText(member.role || '', {
        x: cx, y: avatarY + avatarSize + 0.5, w: cardW, h: 0.2,
        fontFace: t.typography.fontBody, fontSize: t.typography.sizeSmall,
        color: t.colors.textMuted, italic: true, align: 'center'
    });

    // 経歴
    slide.addText(member.bio || '', {
        x: cx, y: avatarY + avatarSize + 0.8, w: cardW, h: 1.2,
        fontFace: t.typography.fontBody, fontSize: t.typography.sizeSmall - 1,
        color: t.colors.text, align: 'center', valign: 'top', wrap: true, fit: 'shrink'
    });
  });

  return slide;
}

module.exports = renderTeamSlide;
