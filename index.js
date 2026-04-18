/**
 * pptx-skill
 * デザインプロンプトから PowerPoint を生成するスキルライブラリ
 */

const SlideBuilder = require('./lib/SlideBuilder');
const ThemeEngine = require('./lib/ThemeEngine');
const themes = require('./themes');

// レンダラー
const renderers = {
  title: require('./lib/renderers/TitleRenderer'),
  title3: require('./lib/renderers/TitleAccentRenderer'),
  agenda: require('./lib/renderers/AgendaRenderer'),
  overview: require('./lib/renderers/OverviewRenderer'),
  content1: require('./lib/renderers/TwoColumnRenderer'),
  comparison: require('./lib/renderers/ComparisonRenderer'),
  matrix: require('./lib/renderers/MatrixRenderer'),
  data: require('./lib/renderers/DataChartRenderer'),
  data2: require('./lib/renderers/KpiRenderer'),
  flow: require('./lib/renderers/FlowRenderer'),
  timeline: require('./lib/renderers/TimelineRenderer'),
  featurelist: require('./lib/renderers/FeatureListRenderer'),
  team: require('./lib/renderers/TeamRenderer'),
  quote: require('./lib/renderers/QuoteRenderer'),
  imagetext: require('./lib/renderers/ImageTextRenderer'),
};

module.exports = {
  SlideBuilder,
  ThemeEngine,
  themes,
  renderers,
};
