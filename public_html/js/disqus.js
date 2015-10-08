(function () {
  var live = location.hostname === 'akusius.github.io';

  var disqus = {};
  disqus.shortname = live ? 'akusius-palenque' : 'akusius-palenque-test';
  disqus.identifier = location.pathname.replace(/^(\/.+?\/)/, '');
  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && live) {
    disqus.url = canonical.href;
  }

  for (var prop in disqus) {
    if (disqus.hasOwnProperty(prop)) {
      window['disqus_' + prop] = disqus[prop];
    }
  }

  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();