import { omit, set, isFunction, chunk, forEach, get, clone } from "lodash";

const Analytics = {
  init: function (googleAnalyticsCode = "") {
    if (!googleAnalyticsCode) {
      return null;
    }

    return (
      <>
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={'https://www.googletagmanager.com/gtag/js?id=' + googleAnalyticsCode}
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
};

export default Analytics;
