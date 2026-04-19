/**
 * テーマライブラリ
 * 組み込みテーマを名前で取得する
 */

const chalkboard       = require('./chalkboard.json');
const blueModern       = require('./blue-modern.json');
const darkNeon         = require('./dark-neon.json');
const blueProfessional = require('./blue-professional.json');
const dustyPurple      = require('./dusty-purple.json');
const blue             = require('./blue.json');
const natureGreen      = require('./nature-green.json');
const midnightOnyx    = require('./midnight-onyx.json');
const navyBeige        = require('./navy-beige.json');
const terracottaEarth  = require('./terracotta-earth.json');
const elegantMuted     = require('./elegant-muted.json');
const cafeLatte        = require('./cafe-latte.json');

const THEMES = {
  chalkboard,
  'blue-modern': blueModern,
  'dark-neon': darkNeon,
  'blue-professional': blueProfessional,
  'dusty-purple': dustyPurple,
  blue,
  'nature-green': natureGreen,
  'midnight-onyx': midnightOnyx,
  'navy-beige': navyBeige,
  'terracotta-earth': terracottaEarth,
  'elegant-muted': elegantMuted,
  'cafe-latte': cafeLatte,
};

/**
 * テーマIDで取得
 * @param {string} id
 * @returns {object|null}
 */
function getTheme(id) {
  return THEMES[id] || null;
}

/**
 * 全テーマID一覧
 * @returns {string[]}
 */
function listThemes() {
  return Object.keys(THEMES);
}

/**
 * 業種タグでテーマを絞り込む
 * @param {string} industry
 * @returns {object[]}
 */
function getThemesByIndustry(industry) {
  return Object.values(THEMES).filter(t =>
    t.tone?.industry?.includes(industry)
  );
}

module.exports = { getTheme, listThemes, getThemesByIndustry, THEMES };
