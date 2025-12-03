import useWebInstance from 'grandus-lib/hooks/useWebInstance';
import { getDevMeta, getDocumentInitialProps } from 'grandus-lib/utils';
import TagManager from 'grandus-lib/utils/gtag';
import FBPixel from 'grandus-lib/utils/fbpixel';
import Analytics from 'grandus-lib/utils/analytics';

const MetaHead = ({ children }) => {
  const { webInstance } = useWebInstance();

  const data = getDocumentInitialProps(webInstance);

  const {
    customScripts,
    googleAnalyticsCode,
    googleTagManagerCode,
    fbPixelCode,
    favicon,
  } = data;

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      {getDevMeta()}
      {process.env.NEXT_PUBLIC_IMAGE_HOST ? (
        <>
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_IMAGE_HOST} />
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_IMAGE_HOST} />
        </>
      ) : (
        ''
      )}
      <link rel="icon" href={favicon || '/favicon.ico'} />
      {Analytics.init(googleAnalyticsCode)}
      {TagManager.init(googleTagManagerCode)}
      {FBPixel.init(fbPixelCode)}
      {children}
      {customScripts ? (
        <section
          async
          defer
          dangerouslySetInnerHTML={{
            __html: customScripts,
          }}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default MetaHead;
