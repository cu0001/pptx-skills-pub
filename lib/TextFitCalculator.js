/**
 * TextFitCalculator
 * ボックス幅、フォントサイズ、文字数の関係を計算し、
 * 視認性を保ちながら確実に収まるフォントサイズを決定する
 */

class TextFitCalculator {
  /**
   * 文字幅の推定値（ポイント単位）
   * 実際のフォントレンダリングに基づく経験的な値
   */
  static CHAR_WIDTH_RATIOS = {
    // 日本語（全角）: フォントサイズに対する幅の比率
    fullWidth: 1.0,
    // 英数字（半角）: フォントサイズに対する幅の比率
    halfWidth: 0.6,
    // スペース
    space: 0.3,
  };

  /**
   * 視認性を保つための最小フォントサイズ
   */
  static MIN_FONT_SIZES = {
    title: 20,      // タイトル
    subtitle: 14,   // サブタイトル
    body: 11,       // 本文
    small: 9,       // 小さい文字
  };

  /**
   * 文字列の推定幅を計算（ポイント単位）
   * @param {string} text - 計算対象のテキスト
   * @param {number} fontSize - フォントサイズ（ポイント）
   * @returns {number} 推定幅（ポイント）
   */
  static estimateTextWidth(text, fontSize) {
    let totalWidth = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      
      // 全角文字の判定（日本語、中国語、韓国語など）
      if (code > 0x3000) {
        totalWidth += fontSize * this.CHAR_WIDTH_RATIOS.fullWidth;
      }
      // スペース
      else if (char === ' ') {
        totalWidth += fontSize * this.CHAR_WIDTH_RATIOS.space;
      }
      // 半角文字（英数字、記号）
      else {
        totalWidth += fontSize * this.CHAR_WIDTH_RATIOS.halfWidth;
      }
    }
    
    return totalWidth;
  }

  /**
   * インチをポイントに変換
   * @param {number} inches - インチ
   * @returns {number} ポイント
   */
  static inchesToPoints(inches) {
    return inches * 72; // 1インチ = 72ポイント
  }

  /**
   * ボックス幅に収まる最適なフォントサイズを計算
   * @param {string} text - テキスト
   * @param {number} boxWidthInches - ボックス幅（インチ）
   * @param {number} initialFontSize - 初期フォントサイズ（ポイント）
   * @param {string} minSizeType - 最小サイズのタイプ（'title', 'body', 'small'）
   * @param {number} lineCount - 行数（デフォルト: 1）
   * @returns {number} 最適なフォントサイズ（ポイント）
   */
  static calculateOptimalFontSize(text, boxWidthInches, initialFontSize, minSizeType = 'body', lineCount = 1) {
    const boxWidthPoints = this.inchesToPoints(boxWidthInches);
    const minFontSize = this.MIN_FONT_SIZES[minSizeType] || this.MIN_FONT_SIZES.body;
    
    // 1行あたりの利用可能幅
    const availableWidthPerLine = boxWidthPoints * 0.95; // 5%のマージンを確保
    
    // 初期サイズで試算
    let fontSize = initialFontSize;
    let estimatedWidth = this.estimateTextWidth(text, fontSize);
    
    // 複数行の場合、1行あたりの文字数で計算
    const charsPerLine = Math.ceil(text.length / lineCount);
    const textPerLine = text.substring(0, charsPerLine);
    estimatedWidth = this.estimateTextWidth(textPerLine, fontSize);
    
    // 幅が収まらない場合、フォントサイズを縮小
    while (estimatedWidth > availableWidthPerLine && fontSize > minFontSize) {
      fontSize -= 0.5;
      estimatedWidth = this.estimateTextWidth(textPerLine, fontSize);
    }
    
    // 最小サイズを下回らないように
    return Math.max(fontSize, minFontSize);
  }

  /**
   * テキストが指定幅に収まるかチェック
   * @param {string} text - テキスト
   * @param {number} boxWidthInches - ボックス幅（インチ）
   * @param {number} fontSize - フォントサイズ（ポイント）
   * @returns {boolean} 収まる場合true
   */
  static willTextFit(text, boxWidthInches, fontSize) {
    const boxWidthPoints = this.inchesToPoints(boxWidthInches);
    const estimatedWidth = this.estimateTextWidth(text, fontSize);
    return estimatedWidth <= boxWidthPoints * 0.95; // 5%のマージンを確保
  }

  /**
   * 推奨される行数を計算
   * @param {string} text - テキスト
   * @param {number} boxWidthInches - ボックス幅（インチ）
   * @param {number} fontSize - フォントサイズ（ポイント）
   * @returns {number} 推奨行数
   */
  static calculateRecommendedLines(text, boxWidthInches, fontSize) {
    const boxWidthPoints = this.inchesToPoints(boxWidthInches);
    const totalWidth = this.estimateTextWidth(text, fontSize);
    const availableWidthPerLine = boxWidthPoints * 0.95;
    
    return Math.ceil(totalWidth / availableWidthPerLine);
  }

  /**
   * 複数行テキストの最適なフォントサイズを計算
   * @param {Array<string>} lines - テキスト行の配列
   * @param {number} boxWidthInches - ボックス幅（インチ）
   * @param {number} initialFontSize - 初期フォントサイズ（ポイント）
   * @param {string} minSizeType - 最小サイズのタイプ
   * @returns {number} 最適なフォントサイズ（ポイント）
   */
  static calculateOptimalFontSizeForMultipleLines(lines, boxWidthInches, initialFontSize, minSizeType = 'body') {
    // 最も長い行を基準に計算
    const longestLine = lines.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    
    return this.calculateOptimalFontSize(longestLine, boxWidthInches, initialFontSize, minSizeType, 1);
  }
}

module.exports = TextFitCalculator;
