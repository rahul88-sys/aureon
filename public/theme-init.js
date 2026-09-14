(() => {
  try {
    var t = localStorage.getItem("aureon-theme");
    if (t !== "signal" && t !== "modern") t = "signal";
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "signal";
  }
})();
