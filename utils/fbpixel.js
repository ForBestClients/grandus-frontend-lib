const FBPixel = {
  init: function (fbPixelCode = "") {
    if (!fbPixelCode) {
      return null;
    }

    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelCode}');
            fbq('track', 'PageView');
            `,
        }}
      />
    );
  },
  registerPageViewTracking: function (router) {
    if (this.isEnabled()) {
      router.events.on("routeChangeComplete", this.pageView);
      return () => {
        router.events.off("routeChangeComplete", this.pageView);
      };
    }
  },
  isEnabled: function () {
    return window !== undefined && window.fbq;
  },
  pageView: function () {
    fbq("track", "PageView");
  },
};

export default FBPixel;
