import { isFunction } from 'lodash';

const TagManager = {
  googleAnalyticsCode: "",
  init: function (googleAnalyticsCode = "") {
    this.googleAnalyticsCode = googleAnalyticsCode;
    console.log('init', this.googleAnalyticsCode);
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
  push: function (data, callback) {
    if (this.isEnabled()) {
      dataLayer.push(data);
    }

    if (isFunction(callback)) {
      callback(data)
    }
  },
};

export default TagManager;
