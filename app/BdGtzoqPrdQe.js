
    (function() {
      var baseURL = "https://cdn.shopify.com/shopifycloud/checkout-web/assets/";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/runtime.latest.pt-BR.bfd62c8556e9094a4035.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/902.latest.pt-BR.8bf254f81ba9083833c8.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/114.latest.pt-BR.c10601cb53ddc81e5051.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/991.latest.pt-BR.9c44aa3fb5e5c3cd39f5.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/app.latest.pt-BR.59cff4d106d8f507c7b3.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/845.latest.pt-BR.6db36d65de55b15facf0.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/569.latest.pt-BR.406f42dec60e3e93493f.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/462.latest.pt-BR.d82944dd0cd4dca5f569.js","../../cdn.shopify.com/shopifycloud/checkout-web/assets/18.latest.pt-BR.ca56b69083fc21d89c48.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/OnePage.latest.pt-BR.698491b23d1468eeafec.js"];
      var styles = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/902.latest.pt-BR.e3249b8edfbd78330bac.css","../../cdn.shopify.com/shopifycloud/checkout-web/assets/app.latest.pt-BR.cb805ff4853f77f7b3bf.css","https://cdn.shopify.com/shopifycloud/checkout-web/assets/268.latest.pt-BR.b1a85f925b41702ad78f.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [baseURL].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res[0], next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET.html', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        })();
      }

      function onLoaded() {
        preconnectAssets();
        prefetchAssets();
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  