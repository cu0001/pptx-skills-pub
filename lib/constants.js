/**
 * Shared layout constants used by SlideBuilder and renderers.
 * All values are in PptxGenJS inches (10" × 5.625" = 16:9).
 */
module.exports = {
  SLIDE_W: 10,
  SLIDE_H: 5.625,
  ACCENT_BAR_H: 0.06,   // standard top accent bar (content slides)
  TITLE_BAR_H: 0.08,    // wider bar for TitleRenderer / QuoteRenderer
  TITLE_Y: 0.12,        // top of slide title text box
  TITLE_H: 0.65,        // height of slide title text box
  LINE_HEIGHT_MULTIPLIER: 1.4,
  TEXT_FIT_MARGIN: 0.05,
};
