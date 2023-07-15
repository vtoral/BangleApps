/**
 * Apply appropriate theme for given mode
 * @param {int} mode Quiet Mode
 */
function switchTheme(mode) {
  let s = require("Storage").readJSON("setting.json", 1) || {};
  print("Theme is ", s.theme);
  if (!!mode === s.theme.quiet) return; // nothing to do
  // default themes, copied from settings.js:showThemeMenu()
  function cl(x) { return g.setColor(x).getColor(); }

  let q = require("Storage").readJSON("qmsched.json", 1) || {};
  let quietTheme = {
    // 'Dark BW'
    fg: cl("#fff"), bg: cl("#000"),
    fg2: cl("#0ff"), bg2: cl("#000"),
    fgH: cl("#fff"), bgH: cl("#00f"),
    dark: true,
    quiet: true
  };
  let normalTheme = {
    // 'Light BW'
    fg: cl("#000"), bg: cl("#fff"),
    fg2: cl("#000"), bg2: cl("#cff"),
    fgH: cl("#000"), bgH: cl("#0ff"),
    dark: false,
    quiet: false
  };

  if (q.normalTheme) normalTheme = q.normalTheme;
  if (q.quietTheme) quietTheme = q.quietTheme;

  s.theme = mode ? quietTheme : normalTheme;
  print("New theme is ", s.theme);

  require("Storage").writeJSON("setting.json", s);
  // reload clocks with new theme, otherwise just wait for user to switch apps
  if (Bangle.CLOCK) load(global.__FILE__);
}
/**
 * Apply LCD options and theme for given mode
 * @param {int} mode Quiet Mode
 */
exports.applyOptions = function(mode) {
  const s = require("Storage").readJSON(mode ? "qmsched.json" : "setting.json", 1) || {};
  const get = (k, d) => k in s ? s[k] : d;
  Bangle.setOptions(get("options", {}));
  Bangle.setLCDBrightness(get("brightness", 1));
  Bangle.setLCDTimeout(get("timeout", 10));
  if ((require("Storage").readJSON("qmsched.json", 1) || {}).switchTheme) switchTheme(mode);
};
/**
 * Set new Quiet Mode and apply Bangle options
 * @param {int} mode Quiet Mode
 */
exports.setMode = function(mode) {
  require("Storage").writeJSON("setting.json", Object.assign(
    require("Storage").readJSON("setting.json", 1) || {},
    {quiet:mode}
  ));
  exports.applyOptions(mode);
  if (typeof WIDGETS === "object" && "qmsched" in WIDGETS) WIDGETS["qmsched"].draw();
  if (global.setAppQuietMode) setAppQuietMode(mode); // current app knows how to update itself
};
