/**
 * LayoutCalculator
 * スライドのグリッド・カードレイアウトを計算するユーティリティ。
 * Renderer 内のハードコードされた座標計算を集約する。
 *
 * 全ての座標は PptxGenJS インチ単位（10" × 5.625" = 16:9）。
 */

const { SLIDE_W, SLIDE_H } = require('./constants');

/**
 * n 個の要素をグリッド配置するための列・行・セルサイズを計算する。
 *
 * @param {number} count          - 要素数
 * @param {object} opts
 * @param {number} [opts.margin=0.5]      - スライド外周マージン（インチ）
 * @param {number} [opts.gutterH=0.3]     - 水平ガター（インチ）
 * @param {number} [opts.gutterV=0.3]     - 垂直ガター（インチ）
 * @param {number} [opts.titleAreaH=0.9]  - タイトル行の高さ（インチ）
 * @param {number} [opts.slideW=SLIDE_W]
 * @param {number} [opts.slideH=SLIDE_H]
 * @returns {{ cols, rows, cellW, cellH, startX, startY }}
 */
function computeGrid(count, opts = {}) {
  const {
    margin = 0.5,
    gutterH = 0.3,
    gutterV = 0.3,
    titleAreaH = 0.9,
    slideW = SLIDE_W,
    slideH = SLIDE_H,
    maxCols,
  } = opts;

  const defaultCols = count <= 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 2 : 3;
  const cols = maxCols ? Math.min(count, maxCols) : defaultCols;
  const rows = Math.ceil(count / cols);

  const availW = slideW - margin * 2;
  const availH = slideH - titleAreaH - margin;

  const cellW = (availW - gutterH * (cols - 1)) / cols;
  const cellH = (availH - gutterV * (rows - 1)) / rows;

  return {
    cols,
    rows,
    cellW,
    cellH,
    startX: margin,
    startY: titleAreaH,
  };
}

/**
 * n 個のカードの { x, y, w, h } 配列を返す。
 *
 * @param {number} count
 * @param {object} opts - computeGrid と同じオプション
 * @returns {Array<{x:number, y:number, w:number, h:number}>}
 */
function computeCards(count, opts = {}) {
  const { cols, cellW, cellH, startX, startY } = computeGrid(count, opts);
  const gutterH = opts.gutterH ?? 0.3;
  const gutterV = opts.gutterV ?? 0.3;

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: startX + col * (cellW + gutterH),
      y: startY + row * (cellH + gutterV),
      w: cellW,
      h: cellH,
    };
  });
}

/**
 * 1行横並びカードを水平中央揃えで配置する座標配列を返す。
 * FeatureListRenderer / TeamRenderer のように「常に1行、中央揃え」のレイアウトに使う。
 *
 * @param {number} count
 * @param {object} opts
 * @param {number} [opts.gutter=0.3]    - カード間スペース（インチ）
 * @param {number} [opts.cardY=1.5]     - カード上端の Y 座標
 * @param {number} [opts.cardH=2.8]     - カードの高さ
 * @param {number} [opts.marginH=0.7]   - 幅計算に使う水平マージン（両側）
 * @param {number} [opts.slideW=SLIDE_W]
 * @returns {Array<{x:number, y:number, w:number, h:number}>}
 */
function computeRow(count, opts = {}) {
  const {
    gutter = 0.3,
    cardY = 1.5,
    cardH = 2.8,
    marginH = 0.7,
    slideW = SLIDE_W,
  } = opts;

  if (count === 0) return [];

  const availW = slideW - marginH * 2;
  const cardW = (availW - gutter * (count - 1)) / count;
  const totalW = cardW * count + gutter * (count - 1);
  const startX = (slideW - totalW) / 2;

  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (cardW + gutter),
    y: cardY,
    w: cardW,
    h: cardH,
  }));
}

module.exports = { computeGrid, computeCards, computeRow };
