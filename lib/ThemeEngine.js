/**
 * ThemeEngine
 * ユーザー/LLMから受け取ったThemeTokenを検証・サニタイズし、
 * PptxGenJSが安全に使えるクリーンな設定オブジェクトを生成する。
 *
 * 主な責務:
 *  - '#' 付き色コードの除去
 *  - 負のshadow.offsetのクランプ（0以上に強制）
 *  - 8文字HEXカラー（透過エンコード）の検出とエラー
 *  - フォントのクロスプラットフォーム安全候補へのフォールバック
 *  - 必須フィールドの欠損時のデフォルト値補完
 */

// Win/Mac両対応のクロスプラットフォーム安全フォントリスト
const SAFE_FONTS = [
  'Arial', 'Calibri', 'Georgia', 'Trebuchet MS', 'Comic Sans MS',
  'Courier New', 'Times New Roman', 'Verdana',
  'Meiryo', 'Meiryo UI', 'Yu Gothic', 'MS Gothic', 'MS Mincho',
  'IBM Plex Sans JP', 'IBM Plex Sans', 'IBM Plex Mono', 'IBM Plex Serif', // IBM環境向け
];

// フォールバックマッピング（危険なフォント → 安全フォント）
const FONT_FALLBACK = {
  'Chalkboard SE'     : 'Comic Sans MS', // macOS専用 → Win/Macで似た手書き風
  'Hiragino Sans'     : 'Meiryo',        // macOS専用 → Win対応ゴシック
  'Hiragino Kaku Gothic ProN': 'Meiryo',
  'San Francisco'     : 'Calibri',
  'SF Pro'            : 'Calibri',
  'Noto Sans'         : 'Arial',
};

class ThemeEngine {
  /**
   * テーマトークンを受け取り、検証・サニタイズしたテーマを返す
   * @param {object} rawTheme - テーマJSON（LLM出力 or ファイルから読んだもの）
   * @returns {object} sanitizedTheme
   */
  static sanitize(rawTheme) {
    const theme = JSON.parse(JSON.stringify(rawTheme)); // deep copy

    // --- colors ---
    if (theme.colors) {
      for (const [key, val] of Object.entries(theme.colors)) {
        if (key === 'backgroundGradient') continue; // 別途処理
        theme.colors[key] = ThemeEngine.sanitizeColor(val, key);
      }
      // 必須カラーキーが欠損している場合はデフォルト値を補完
      const defaultColors = ThemeEngine._defaultColors();
      for (const [key, val] of Object.entries(defaultColors)) {
        if (theme.colors[key] === undefined) {
          theme.colors[key] = val;
        }
      }
      if (theme.colors.backgroundGradient) {
        const bg = theme.colors.backgroundGradient;
        bg.enabled = !!bg.enabled;
        bg.color1 = ThemeEngine.sanitizeColor(bg.color1 || theme.colors.background, 'backgroundGradient.color1');
        bg.color2 = ThemeEngine.sanitizeColor(bg.color2 || theme.colors.surface || 'FFFFFF', 'backgroundGradient.color2');
        bg.angle = ThemeEngine.clamp(bg.angle ?? 90, 0, 359, 90);
      }
    } else {
      theme.colors = ThemeEngine._defaultColors();
    }

    // --- typography ---
    if (theme.typography) {
      theme.typography.fontTitle = ThemeEngine.sanitizeFont(theme.typography.fontTitle, 'Calibri');
      theme.typography.fontBody  = ThemeEngine.sanitizeFont(theme.typography.fontBody, 'Meiryo');
      theme.typography.sizeTitleLarge  = ThemeEngine.clamp(theme.typography.sizeTitleLarge, 20, 60, 36);
      theme.typography.sizeTitleMedium = ThemeEngine.clamp(theme.typography.sizeTitleMedium, 16, 48, 24);
      theme.typography.sizeBody        = ThemeEngine.clamp(theme.typography.sizeBody, 10, 36, 16);
      theme.typography.sizeSmall       = ThemeEngine.clamp(theme.typography.sizeSmall, 8, 24, 11);
    } else {
      theme.typography = ThemeEngine._defaultTypography();
    }

    // --- shapes / shadow ---
    if (theme.shapes) {
      theme.shapes.cornerRadius       = ThemeEngine.clamp(theme.shapes.cornerRadius ?? 0, 0, 0.5, 0);
      theme.shapes.borderWidth        = ThemeEngine.clamp(theme.shapes.borderWidth ?? 0, 0, 10, 0);
      theme.shapes.borderTransparency = ThemeEngine.clamp(theme.shapes.borderTransparency ?? 0, 0, 100, 0);

      if (theme.shapes.shadow) {
        const s = theme.shapes.shadow;
        s.color   = ThemeEngine.sanitizeColor(s.color ?? '000000', 'shadow.color');
        s.blur    = ThemeEngine.clamp(s.blur ?? 6, 0, 100, 6);
        s.offset  = Math.max(0, s.offset ?? 2); // 負の値は0に強制
        s.angle   = ThemeEngine.clamp(s.angle ?? 135, 0, 359, 135);
        s.opacity = ThemeEngine.clamp(s.opacity ?? 0.15, 0.0, 1.0, 0.15);
      }
      
      const allowedDecorations = ['none', 'dots', 'circles', 'triangles'];
      theme.shapes.decorations = allowedDecorations.includes(theme.shapes.decorations) ? theme.shapes.decorations : 'none';

    } else {
      theme.shapes = ThemeEngine._defaultShapes();
    }

    // --- layout ---
    if (!theme.layout) {
      theme.layout = { margin: 0.5, gutterV: 0.3, gutterH: 0.4, accentBarWidth: 0.08, headerStyle: 'none' };
    } else {
      const allowedHeaders = ['none', 'underline', 'solidBar'];
      theme.layout.headerStyle = allowedHeaders.includes(theme.layout.headerStyle) ? theme.layout.headerStyle : 'none';
      theme.layout.margin = ThemeEngine.clamp(theme.layout.margin ?? 0.5, 0, 2.0, 0.5);
      theme.layout.gutterV = ThemeEngine.clamp(theme.layout.gutterV ?? 0.3, 0, 2.0, 0.3);
      theme.layout.gutterH = ThemeEngine.clamp(theme.layout.gutterH ?? 0.4, 0, 2.0, 0.4);
      theme.layout.accentBarWidth = ThemeEngine.clamp(theme.layout.accentBarWidth ?? 0.08, 0, 2.0, 0.08);
    }

    // --- chart ---
    if (theme.chart) {
      if (Array.isArray(theme.chart.colors)) {
        theme.chart.colors = theme.chart.colors.map(c => ThemeEngine.sanitizeColor(c, 'chart.color'));
      } else {
        theme.chart.colors = ThemeEngine._defaultChart().colors;
      }
      theme.chart.roundedCorners = theme.chart.roundedCorners ?? false;
      theme.chart.gridStyle = theme.chart.gridStyle ?? 'solid';
    } else {
      theme.chart = ThemeEngine._defaultChart();
    }

    return theme;
  }

  /**
   * 色コードをサニタイズ（'#'除去、8文字HEXを弾く）
   * @param {string} color
   * @param {string} fieldName - エラーログ用
   * @returns {string} 6文字のHEX
   */
  static sanitizeColor(color, fieldName = '') {
    if (typeof color !== 'string') {
      console.warn(`[ThemeEngine] ${fieldName}: 色コードが文字列ではありません (${color})。デフォルト '000000' を使用。`);
      return '000000';
    }

    // '#'を除去
    let c = color.startsWith('#') ? color.slice(1) : color;

    // 8文字HEX（透過エンコード）を検出
    if (c.length === 8) {
      console.warn(`[ThemeEngine] ${fieldName}: 8文字HEX '${c}' はファイル破損の原因です。末尾2文字を除去します。opacityフィールドを使用してください。`);
      c = c.slice(0, 6);
    }

    // 3文字HEXを6文字に展開
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }

    // 検証（6文字の16進数か）
    if (!/^[0-9A-Fa-f]{6}$/.test(c)) {
      console.warn(`[ThemeEngine] ${fieldName}: 不正な色コード '${c}'。デフォルト '000000' を使用。`);
      return '000000';
    }

    return c.toUpperCase();
  }

  /**
   * 与えられた色（HEX）の輝度を計算し、コントラストの高いテキスト色を返す
   * @param {string} hexColor - 6文字のHEX
   * @param {string} themeText - 明るい背景時に使用する色（デフォルト: 1E293B）
   * @param {string} lightColor - 暗い背景時に使用する色（デフォルト: FFFFFF）
   * @returns {string} 
   */
  static getContrastColor(hexColor, themeText = '1E293B', lightColor = 'FFFFFF') {
    const c = ThemeEngine.sanitizeColor(hexColor, 'getContrastColor');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    
    // YIQ輝度公式（人間の知覚に基づいた重み付け）
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 128を境界とするのが一般的だが、プレゼン資料では少し早めに黒に切り替えたほうが安定する（150程度）
    return yiq >= 150 ? themeText : lightColor;
  }

  /**
   * フォントをサニタイズ（危険なフォントをフォールバック）
   * @param {string} fontName
   * @param {string} defaultFont
   * @returns {string}
   */
  static sanitizeFont(fontName, defaultFont = 'Calibri') {
    if (!fontName) return defaultFont;

    // フォールバックマッピングを確認
    if (FONT_FALLBACK[fontName]) {
      const fallback = FONT_FALLBACK[fontName];
      console.info(`[ThemeEngine] フォント '${fontName}' はクロスプラットフォーム非対応のため '${fallback}' に変換します。`);
      return fallback;
    }

    // 安全リスト外でも警告のみで通す（ユーザーが意図的に指定した場合）
    if (!SAFE_FONTS.includes(fontName)) {
      console.warn(`[ThemeEngine] フォント '${fontName}' は安全リスト外です。Windows環境により異なるフォントが適用される可能性があります。`);
    }

    return fontName;
  }

  /**
   * 数値を min〜max の範囲にクランプ
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @param {number} defaultVal
   * @returns {number}
   */
  static clamp(val, min, max, defaultVal) {
    if (typeof val !== 'number' || isNaN(val)) return defaultVal;
    return Math.min(max, Math.max(min, val));
  }

  // ---------- デフォルト値 ----------

  static _defaultColors() {
    return {
      background: 'FFFFFF', surface: 'F8FAFC',
      primary: '0284C7', secondary: '38BDF8',
      text: '1E293B', textMuted: '64748B', border: 'E2E8F0'
    };
  }

  static _defaultTypography() {
    return {
      fontTitle: 'Calibri', fontBody: 'Meiryo',
      sizeTitleLarge: 36, sizeTitleMedium: 24, sizeBody: 16, sizeSmall: 11
    };
  }

  static _defaultShapes() {
    return {
      style: 'flat', cornerRadius: 0.1, borderWidth: 0,
      borderDash: 'none', borderTransparency: 100,
      decorations: 'none',
      shadow: { enabled: false, type: 'outer', color: '000000', blur: 6, offset: 2, angle: 135, opacity: 0.15 }
    };
  }

  static _defaultChart() {
    return {
      colors: ['0284C7', '38BDF8', '7DD3FC', '0EA5E9', '0369A1'],
      roundedCorners: false,
      gridStyle: 'solid',
    };
  }
}

module.exports = ThemeEngine;
