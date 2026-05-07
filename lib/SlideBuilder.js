/**
 * SlideBuilder
 * PptxGenJS の安全なラッパークラス。
 * ThemeEngine でサニタイズ済みのテーマトークンを受け取り、
 * スライドの描画メソッドを提供する。
 *
 * 設計原則:
 *  - LLMには絶対にrawなPptxGenJSコードを生成させない
 *  - optionオブジェクトは必ず関数 (makeShadow等) で毎回新規生成する
 *  - 全ての色・数値はThemeEngineを通過済みであることを前提とする
 */

const pptxgen = require('pptxgenjs');
const ThemeEngine = require('./ThemeEngine');
const { getTheme } = require('../themes');

class SlideBuilder {
  /**
   * @param {object|string} theme - ThemeToken オブジェクト または テーマID文字列
   */
  constructor(theme) {
    // テーマIDが文字列なら読み込む
    const rawTheme = typeof theme === 'string' ? getTheme(theme) : theme;
    if (!rawTheme) throw new Error(`テーマ '${theme}' が見つかりません。`);

    // サニタイズ済みテーマを保持
    this.theme = ThemeEngine.sanitize(rawTheme);

    // 言語設定（スペルチェックの赤波線を防ぐため全テキストに付与）
    // テーマに lang が指定されていればそれを使用、なければ 'ja-JP' をデフォルトとする
    this.lang = rawTheme.lang || 'ja-JP';

    // PptxGenJS インスタンス（プレゼンごとに fresh な状態を保証）
    this.pres = new pptxgen();
    this.pres.layout = 'LAYOUT_16x9';
    this.pres.title  = this.theme.name || 'Presentation';

    // スライドマスター登録（背景と装飾のみ。コンテンツはdirect配置）
    this._registerMaster();
  }

  /**
   * マスターレイアウト登録（装飾・背景のみ）
   */
  _registerMaster() {
    const t = this.theme;
    const objects = [];

    // Background Gradient: color2を背景色として敷き、color1の三角形をオーバーレイして2トーンにする
    if (t.colors.backgroundGradient && t.colors.backgroundGradient.enabled) {
      const bg = t.colors.backgroundGradient;
      objects.push({
        polygon: {
          x: 0, y: 0, w: '100%', h: '100%',
          points: [ {x:0,y:0}, {x:10,y:0}, {x:0,y:5.625} ],
          fill: { color: bg.color1, transparency: 0 }
        }
      });
    }

    // Header Style
    if (t.layout.headerStyle === 'solidBar') {
      objects.push({
        rect: { x: 0, y: 0, w: '100%', h: 0.3, fill: { color: t.colors.primary } }
      });
    } else if (t.layout.headerStyle === 'underline') {
      objects.push({
        line: { x: 0.5, y: 1.0, w: 9.0, h: 0, line: { color: t.colors.border, width: 2 } }
      });
    }

    // Decorations
    if (t.shapes.decorations === 'circles') {
      objects.push({
        oval: { x: 8.0, y: -1.0, w: 3, h: 3, fill: { color: t.colors.primary, transparency: 90 } }
      });
      objects.push({
        oval: { x: 9.2, y: 1.5, w: 1, h: 1, fill: { color: t.colors.secondary, transparency: 85 } }
      });
    } else if (t.shapes.decorations === 'dots') {
      for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
          objects.push({
            oval: { x: 8.8 + c*0.15, y: 0.3 + r*0.15, w: 0.04, h: 0.04, fill: { color: t.colors.textMuted, transparency: 60 } }
          });
        }
      }
    } else if (t.shapes.decorations === 'triangles') {
      objects.push({
        polygon: { x: 8.5, y: 0.5, w: 0.8, h: 0.8, points: [ {x:0.4,y:0}, {x:0.8,y:0.8}, {x:0,y:0.8} ], fill: { color: t.colors.secondary, transparency: 80 } }
      });
    }

    const bgColor = (t.colors.backgroundGradient && t.colors.backgroundGradient.enabled)
      ? t.colors.backgroundGradient.color2
      : t.colors.background;

    this.pres.defineSlideMaster({
      title: 'BASE',
      background: { color: bgColor },
      objects: objects
    });
  }

  /**
   * 新しいスライドを追加して返す
   * @returns {object} slide
   */
  addSlide() {
    return this.pres.addSlide({ masterName: 'BASE' });
  }

  /**
   * 全 Renderer 冒頭の 5 行ボイラープレートを 1 行に集約するヘルパー
   * @returns {{ slide, t, m, slideW, slideH }}
   */
  createSlideContext() {
    const slide = this.addSlide();
    const t = this.theme;
    const m = t.layout.margin;
    const slideW = 10;
    const slideH = 5.625;
    return { slide, t, m, slideW, slideH };
  }

  /**
   * コンテンツスライド用のトップアクセントバー（h=0.06）を追加
   * @param {object} slide
   * @param {string} [color] - 省略時は theme.colors.primary
   */
  addTopAccentBar(slide, color) {
    const t = this.theme;
    slide.addShape(this.pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.06,
      fill: { color: color || t.colors.primary },
      line: { width: 0 },
    });
  }

  /**
   * コンテンツスライド用のタイトル行を追加（y=0.12, h=0.65）
   * @param {object} slide
   * @param {string} title
   */
  addSlideTitle(slide, title) {
    const t = this.theme;
    const m = t.layout.margin;
    slide.addText(title || '', {
      x: m, y: 0.12, w: 10 - m * 2, h: 0.65,
      fontFace: t.typography.fontTitle,
      fontSize: t.typography.sizeTitleMedium,
      color: t.colors.text,
      bold: true,
      valign: 'middle',
      margin: 0,
      lang: this.lang,
    });
  }


  // =========================================================
  // テキスト系ヘルパー
  // =========================================================

  /**
   * テーマ適用済みのタイトルテキストを配置
   * @param {object} slide
   * @param {string} text
   * @param {object} pos - { x, y, w, h }
   * @param {'large'|'medium'} size
   */
  addTitle(slide, text, pos, size = 'large') {
    const t = this.theme;
    const fontSize = size === 'large' ? t.typography.sizeTitleLarge : t.typography.sizeTitleMedium;
    slide.addText(text, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      fontFace: t.typography.fontTitle,
      fontSize,
      color: t.colors.primary,
      bold: true,
      align: pos.align || 'left',
      valign: pos.valign || 'middle',
      margin: pos.margin ?? 0,
      wrap: true,
      lang: this.lang,
    });
  }

  /**
   * テーマ適用済みの本文（複数箇条書き対応）
   * @param {object} slide
   * @param {Array<{text:string, bold?:boolean, color?:string}>} items
   * @param {object} pos - { x, y, w, h }
   * @param {object} overrides - フォント等の上書き
   */
  addBody(slide, items, pos, overrides = {}) {
    const t = this.theme;
    const baseFontSize = overrides.fontSize || t.typography.sizeBody;
    const textArr = items.map((item, i) => ({
      text: item.text,
      options: {
        bullet: item.bullet !== false ? true : false,
        bold: item.bold || false,
        color: ThemeEngine.sanitizeColor(item.color || t.colors.text, 'addBody.item.color'),
        breakLine: i < items.length - 1,
        // overrides で fontSize が指定されている場合はそれを基準にする
        fontSize: item.fontSize || (item.bold ? baseFontSize - 2 : baseFontSize),
        indentLevel: item.indentLevel || 0,
        lang: this.lang,
      }
    }));

    slide.addText(textArr, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      fontFace: t.typography.fontBody,
      fontSize: baseFontSize,
      color: t.colors.text,
      valign: 'top',
      wrap: true,
      lang: this.lang,
      ...overrides,
    });
  }

  /**
   * 補足・注記テキスト（小さめ、muted色）
   */
  addCaption(slide, text, pos) {
    const t = this.theme;
    slide.addText(text, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h || 0.4,
      fontFace: t.typography.fontBody,
      fontSize: t.typography.sizeSmall,
      color: t.colors.textMuted,
      align: pos.align || 'left',
      valign: 'middle',
      margin: 0,
      lang: this.lang,
    });
  }


  // =========================================================
  // 図形系ヘルパー
  // =========================================================

  /**
   * テーマに応じた装飾ボックスを追加（影・枠線・角丸を自動適用）
   * @param {object} slide
   * @param {object} pos - { x, y, w, h }
   * @param {object} overrides - 色などの上書き
   */
  addSurface(slide, pos, overrides = {}) {
    const t = this.theme;
    const s = t.shapes;

    // shadowは毎回新規オブジェクト生成（PptxGenJSの破損バグを回避）
    const shadowOpts = s.shadow && s.shadow.enabled
      ? {
          type: s.shadow.type,
          color: s.shadow.color,
          blur: s.shadow.blur,
          offset: Math.max(0, s.shadow.offset), // 念のため再チェック
          angle: s.shadow.angle,
          opacity: s.shadow.opacity,
        }
      : undefined;

    const shapeType = s.cornerRadius > 0
      ? this.pres.shapes.ROUNDED_RECTANGLE
      : this.pres.shapes.RECTANGLE;

    const opts = {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      fill: { color: overrides.fillColor || t.colors.surface },
      ...(s.borderWidth > 0 && s.borderDash !== 'none' ? {
        line: {
          color: overrides.borderColor || t.colors.border,
          width: s.borderWidth,
          dashType: s.borderDash,
          transparency: s.borderTransparency,
        }
      } : {}),
      ...(s.cornerRadius > 0 ? { rectRadius: s.cornerRadius } : {}),
      ...(shadowOpts ? { shadow: shadowOpts } : {}),
      ...overrides,
    };

    slide.addShape(shapeType, opts);
  }

  /**
   * アクセントカラーの縦帯（左端の強調バー）
   * @param {object} slide
   * @param {object} pos - { x, y, h } ※ 幅は theme.layout.accentBarWidth を使用
   * @param {string?} color - 上書き色（省略時はtheme.colors.primary）
   */
  addAccentBar(slide, pos, color) {
    const t = this.theme;
    slide.addShape(this.pres.shapes.RECTANGLE, {
      x: pos.x,
      y: pos.y,
      w: t.layout.accentBarWidth,
      h: pos.h,
      fill: { color: ThemeEngine.sanitizeColor(color || t.colors.primary, 'accentBar') },
    });
  }

  /**
   * 装飾的な枠線（Chalkboard風の破線枠など）
   * @param {object} slide
   * @param {object} pos - { x, y, w, h }
   */
  addDecorativeFrame(slide, pos) {
    const t = this.theme;
    const s = t.shapes;
    slide.addShape(this.pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      fill: { color: t.colors.background, transparency: 100 }, // 背景色ベースで完全透過
      line: {
        color: t.colors.border,
        width: s.borderWidth || 1.5,
        dashType: s.borderDash || 'dash',
        transparency: s.borderTransparency || 20,
      },
    });
  }

  /**
   * 水平区切り線
   * @param {object} slide
   * @param {number} x, y, w
   */
  addDivider(slide, x, y, w) {
    const t = this.theme;
    slide.addShape(this.pres.shapes.LINE, {
      x, y, w, h: 0,
      line: { color: t.colors.border, width: 1 },
    });
  }


  // =========================================================
  // チャート系ヘルパー
  // =========================================================

  /**
   * モダンスタイルのバーチャートを追加
   * @param {object} slide
   * @param {Array} data - PptxGenJS形式のチャートデータ
   * @param {object} pos - { x, y, w, h }
   * @param {string} title
   */
  addBarChart(slide, data, pos, title = '') {
    const t = this.theme;
    // チャート色はサニタイズ済みであることを保証
    const safeChartColors = (t.chart.colors || []).map(
      (c, i) => ThemeEngine.sanitizeColor(c, `chart.colors[${i}]`)
    );
    const safeTextMuted = ThemeEngine.sanitizeColor(t.colors.textMuted || '64748B', 'chart.axisColor');
    const safeBorder    = ThemeEngine.sanitizeColor(t.colors.border || 'E2E8F0', 'chart.gridColor');
    const safeText      = ThemeEngine.sanitizeColor(t.colors.text || '1E293B', 'chart.labelColor');
    const safeSurface   = ThemeEngine.sanitizeColor(t.colors.surface || 'FFFFFF', 'chart.bgColor');

    slide.addChart(this.pres.charts.BAR, data, {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      barDir: 'col',
      showTitle: !!title,
      title,
      chartColors: safeChartColors,
      chartArea: {
        fill: { color: safeSurface },
        roundedCorners: t.chart.roundedCorners,
      },
      catAxisLabelColor: safeTextMuted,
      valAxisLabelColor: safeTextMuted,
      valGridLine: t.chart.gridStyle === 'none'
        ? { style: 'none' }
        : { color: safeBorder, size: 0.5 },
      catGridLine: { style: 'none' },
      showValue: true,
      dataLabelColor: safeText,
      showLegend: data.length > 1,
      legendPos: 'b',
    });
  }


  // =========================================================
  // ファイル出力
  // =========================================================

  /**
   * .pptxファイルを書き出す
   * @param {string} fileName - 例: "output/slide.pptx"
   */
  async save(fileName) {
    await this.pres.writeFile({ fileName });
    console.log(`✅ 保存完了: ${fileName}`);
  }
}

module.exports = SlideBuilder;
