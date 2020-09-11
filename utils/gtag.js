import { omit, set, isFunction, chunk, forEach, get, clone } from "lodash";

const TagManager = {
  init: function (googleAnalyticsCode = "") {
    if (!googleAnalyticsCode) {
      return null;
    }

    return (
      <>
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsCode}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                window.gtmTrackingId = '${googleAnalyticsCode}';
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsCode}', {
                    page_path: window.location.pathname,
                });
            `,
          }}
        />
      </>
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
  pageView: function (url) {
    window.gtag("config", window.gtmTrackingId, {
      page_path: url,
    });
  },
  push: async function (data, callback) {
    if (this.isEnabled()) {
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
