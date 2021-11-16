import { omit, set, isFunction, chunk, forEach, get, clone } from "lodash";

const NOSCRIPT_STYLE = { display: "none", visibility: "hidden" };

const TagManager = {
  init: function (googleTagManagerCode = "", noscript = true) {
    if (!googleTagManagerCode) {
      return null;
    }

    return (
      <>
        {/* Google Tag Manager */}
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManagerCode}');
            `,
          }}
        />
        {noscript ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerCode}`}
              height="0"
              width="0"
              style={NOSCRIPT_STYLE}
            ></iframe>
          </noscript>
        ) : (
          ""
        )}
      </>
    );
  },
  initNoScript: function (googleTagManagerCode) {
    if (!googleTagManagerCode) return "";

    return (
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerCode}`}
          height="0"
          width="0"
          style={NOSCRIPT_STYLE}
        ></iframe>
      </noscript>
    );
  },
  registerPageViewTracking: function (router) {
    if (this.isEnabled()) {
      const self = this;
      const handleRouteChange = (url) => {
        self.pageView(url);
      };
      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  },
  isEnabled: function () {
    return window !== undefined && window.dataLayer;
  },
  canSendPageview: function () {
    return window !== undefined && window.gtag;
  },
  pageView: function (url) {
    if (this.canSendPageview()) {
      window.gtag("config", window.gtmTrackingId, {
        page_path: url,
      });
    }
  },
  push: async function (data, callback) {
    if (this.isEnabled()) {
      dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
      dataLayer.push(data);
    }

    if (isFunction(callback)) {
      callback(data);
    }
  },
  pushChunked: async function (
    data,
    key = "products",
    chunkSize = 30,
    callback
  ) {
    if (this.isEnabled()) {
      const baseObject = omit(data, key);
      const objectToChunk = get(data, key, []);

      if (objectToChunk.length > chunkSize) {
        let newPushData = {};
        forEach(chunk(objectToChunk, chunkSize), (chunk) => {
          newPushData = clone(baseObject);
          set(newPushData, key, chunk);
          this.push(newPushData);
        });
      }
    }

    if (isFunction(callback)) {
      callback(data);
    }
  },
};

export default TagManager;
