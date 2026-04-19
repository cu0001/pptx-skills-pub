/**
 * ProblemSolutionRenderer - 課題→解決スライド
 *
 * レイアウト:
 *  - 上部タイトル
 *  - 左パネル「課題」: 警告アクセント色 + 課題リスト
 *  - 中央: 矢印または「→」の区切り
 *  - 右パネル「解決」: primary色 + 解決策リスト
 *  - 下部にオプションの補足文
 *
 * 用途:
 *  - 問題定義と提案のセット提示
 *  - Before / After の対比
 *  - 課題整理から施策への橋渡し
 *
 * @param {import('../SlideBuilder')} builder
 * @param {object} content
 * @param {string} content.title
 * @param {string} [content.problemLabel]   - 左パネルの見出し（デフォルト: "課題"）
 * @param {string[]} content.problems       - 課題の箇条書き
 * @param {string} [content.solutionLabel]  - 右パネルの見出し（デフォルト: "解決策"）
 * @param {string[]} content.solutions      - 解決策の箇条書き
 * @param {string} [content.insight]        - 下部の補足・まとめ文（省略可）
 */

const TextFitCalculator = require('../TextFitCalculator');
const ThemeEngine = require('../ThemeEngine');

function renderProblemSolutionSlide(builder, content) {
  const { slide, t, m, slideW, slideH } = builder.createSlideContext();

  builder.addTopAccentBar(slide);
  builder.addSlideTitle(slide, content.title);

  const panelY = 1.0;
  const arrowW = 0.7;
  const panelH = content.insight ? 3.6 : 4.2;
  const halfW = (slideW - m * 2 - arrowW) / 2;

  const problemLabel = content.problemLabel || '課題';
  const solutionLabel = content.solutionLabel || '解決策';

  // 左（課題）パネル背景
  builder.addSurface(slide, { x: m, y: panelY, w: halfW, h: panelH }, {
    fillColor: t.colors.surface,
  });

  // 左パネル上部カラーバー（secondary / warm accent）
  const problemColor = t.colors.secondary;
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: m, y: panelY, w: halfW, h: 0.42,
    fill: { color: problemColor },
    line: { width: 0 },
  });
  slide.addText(problemLabel, {
    x: m, y: panelY, w: halfW, h: 0.42,
    fontFace: t.typography.fontTitle,
    fontSize: t.typography.sizeBody,
    color: ThemeEngine.getContrastColor(problemColor, t.colors.text, 'FFFFFF'),
    bold: true,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });

  // 課題リスト
  const problems = content.problems || [];
  if (problems.length > 0) {
    const itemsText = problems.map((p, i) => ({
      text: p,
      options: {
        bullet: true,
        fontSize: TextFitCalculator.calculateOptimalFontSize(p, halfW - 0.3, t.typography.sizeBody - 1, 'body', 2),
        color: t.colors.text,
        breakLine: i < problems.length - 1,
      },
    }));
    slide.addText(itemsText, {
      x: m + 0.15, y: panelY + 0.52, w: halfW - 0.3, h: panelH - 0.62,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: t.colors.text,
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
  }

  // 中央矢印
  const arrowX = m + halfW;
  const arrowMidY = panelY + panelH / 2;
  slide.addText('→', {
    x: arrowX, y: arrowMidY - 0.25, w: arrowW, h: 0.5,
    fontFace: t.typography.fontTitle,
    fontSize: 28,
    color: t.colors.primary,
    bold: true,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });

  // 右（解決策）パネル背景
  const rightX = m + halfW + arrowW;
  builder.addSurface(slide, { x: rightX, y: panelY, w: halfW, h: panelH }, {
    fillColor: t.colors.surface,
  });

  // 右パネル上部カラーバー（primary）
  slide.addShape(builder.pres.shapes.RECTANGLE, {
    x: rightX, y: panelY, w: halfW, h: 0.42,
    fill: { color: t.colors.primary },
    line: { width: 0 },
  });
  slide.addText(solutionLabel, {
    x: rightX, y: panelY, w: halfW, h: 0.42,
    fontFace: t.typography.fontTitle,
    fontSize: t.typography.sizeBody,
    color: ThemeEngine.getContrastColor(t.colors.primary, t.colors.text, 'FFFFFF'),
    bold: true,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });

  // 解決策リスト
  const solutions = content.solutions || [];
  if (solutions.length > 0) {
    const itemsText = solutions.map((s, i) => ({
      text: s,
      options: {
        bullet: true,
        fontSize: TextFitCalculator.calculateOptimalFontSize(s, halfW - 0.3, t.typography.sizeBody - 1, 'body', 2),
        color: t.colors.text,
        breakLine: i < solutions.length - 1,
      },
    }));
    slide.addText(itemsText, {
      x: rightX + 0.15, y: panelY + 0.52, w: halfW - 0.3, h: panelH - 0.62,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: t.colors.text,
      valign: 'top',
      wrap: true,
      fit: 'shrink',
    });
  }

  // 下部補足文
  if (content.insight) {
    const insightY = panelY + panelH + 0.2;
    builder.addAccentBar(slide, { x: m, y: insightY, h: 0.5 });
    slide.addText(content.insight, {
      x: m + t.layout.accentBarWidth + 0.15,
      y: insightY,
      w: slideW - m * 2 - t.layout.accentBarWidth - 0.15,
      h: 0.5,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeBody - 1,
      color: t.colors.text,
      italic: true,
      valign: 'middle',
    });
  }

  return slide;
}

module.exports = renderProblemSolutionSlide;
