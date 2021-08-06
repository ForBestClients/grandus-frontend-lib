import isEmpty from "lodash/isEmpty";

const MicroDataSearch = ({ webInstance = null }) => {
  if (!isEmpty(webInstance)) {
    const { domain = null } = webInstance;
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "WebSite",
            url: `${domain}`,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${domain}/vyhladavanie/{search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataSearch;
