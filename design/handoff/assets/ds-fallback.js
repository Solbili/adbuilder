/* Dev fallback: if _ds_bundle.js is missing, build the namespace from component sources (sync, before text/babel runs). */
(function () {
  var NS = "SmileLabAdsDesignSystem_b3a8a8";
  if (window[NS] || !window.Babel || !window.React) return;
  var base = new URL("../", document.currentScript.src).href;
  var files = ["brand/Logo", "core/Button", "core/Kicker", "core/Headline", "blocks/Photo", "blocks/TreatmentCard", "blocks/SedeBlock", "blocks/LegalStrip", "blocks/SafeZones", "templates/AdTemplate"];
  var all = [];
  var src = files.map(function (f) {
    var names = [];
    var x = new XMLHttpRequest();
    x.open("GET", base + "components/" + f + ".jsx.txt", false);
    x.send();
    var body = x.responseText
      .replace(/^import .*$/gm, "")
      .replace(/^export (function|const) (\w+)/gm, function (_, k, n) { names.push(n); all.push(n); return k + " " + n; });
    return "var {" + names.join(",") + "} = (function(){" + body + "\nreturn {" + names.join(",") + "};})();";
  }).join("\n");
  var code = Babel.transform(src + "\nwindow." + NS + " = {" + all.join(",") + "};", { presets: ["react"] }).code;
  new Function("React", code)(window.React);
})();
