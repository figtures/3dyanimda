// External script: works with script-src-attr 'none'; no inline event handlers.
document.querySelectorAll('link[data-deferred-stylesheet]').forEach(function (link) {
  link.rel = 'stylesheet';
  link.removeAttribute('onload');
});
