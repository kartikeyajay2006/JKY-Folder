// Applies a saved light/dark preference before the first paint to avoid a theme flash.
try {
  var theme = localStorage.getItem('jky-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (error) {}
