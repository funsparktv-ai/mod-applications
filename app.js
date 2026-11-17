// The site's code now lives inside index.html. This file only exists so a
// browser still holding an old cached index.html reloads the fresh page
// (keeping the Discord login in the #hash) instead of showing a blank card.
location.replace(location.pathname.replace(/index\.html$/, "") + "?r=" + Date.now() + location.hash);
