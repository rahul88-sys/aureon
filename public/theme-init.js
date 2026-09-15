(() => {
  try {
    var t = localStorage.getItem("aureon-theme");
    if (t !== "signal" && t !== "modern") {
      var m = document.cookie.match(/(?:^|; )aureon-theme=([^;]*)/);
      t = m ? decodeURIComponent(m[1]) : "modern";
    }
    if (t !== "signal" && t !== "modern") t = "modern";
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "modern";
  }
})();
