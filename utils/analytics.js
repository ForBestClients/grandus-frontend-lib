const Analytics = {
  init: function (googleAnalyticsCode = "") {
    if (!googleAnalyticsCode) {
      return null;
    }

    return (
      <>
        {/* Google Consent Mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {'ad_storage': 'denied', 'analytics_storage': 'denied', 'wait_for_update': 500});
            `,
          }}
        />

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          defer
          src={
            "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsCode
          }
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
