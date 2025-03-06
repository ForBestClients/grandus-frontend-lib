import isEmpty from "lodash/isEmpty";

const MicroDataNavigation = ({ data = null, webInstance = null }) => {
  if (!isEmpty(webInstance)) {
    const { domain = null } = webInstance;
    
    const siteNavigationElement = data.map(item => ({
      "@type": "SiteNavigationElement",
      name: item.name,
      url: `${domain}${item.path}`,
    }));

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "WebSite",
            url: `${domain}`,
            siteNavigationElement,
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataNavigation;
