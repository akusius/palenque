# The Palenque Code

The HTML5 project for the [Palenque Code](http://akusius.github.io/palenque/) document.

### Technology

Static HTML / CSS / JS files created and edited in NetBeans 8, and post-processed with [PalenqueHtmlProcessor](https://github.com/akusius/palenque-html-processor).

The animated GIF files were generated with the help of the [PalenqueAniGifMaker](https://github.com/akusius/palenque-anigifmaker) utility.

### Publish

The `/public_html` directory is pushed as a subtree to the `gh-pages` branch with this command:

    git subtree push --prefix public_html origin gh-pages

(On Windows the `publish.bat` can also be used to execute this command.)

### Notes

The `/work` directory contains the original `.xcfgz` (GIMP) multi-layered files used for creating the PNGs.

The HTML files include in many places (meta tags, share links, etc.) the absolute URL (domain and path) of the document.  
If you clone the project, these URLs should (must) be changed to your own host and path (e.g. with the help of the [PalenqueHtmlProcessor](https://github.com/akusius/palenque-html-processor) utility, or by performing search & replace on the HTML files).  
Of course, also the [Disqus](public_html/js/disqus.js) and [Google Analytics](public_html/js/analytics.js) IDs must be adjusted.
