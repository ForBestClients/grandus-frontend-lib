import isEmpty from "lodash/isEmpty";
import get from "lodash/get";

const MicroDataOrganization = ({ webInstance = null }) => {
  if (!isEmpty(webInstance)) {
    const { domain = null, globalSettings } = webInstance;
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Organization",
            url: `${domain}`,
            name: `${get(globalSettings, 'companyName')}`,

            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+X-XXX-XXX-XXX",
                contactType: "customer service",
              },
            ],

            address: {
              addressCountry: get(globalSettings, 'state'),
              postalCode: "XXXXX",
              addressLocality: get(globalSettings, 'street_and_number'),
            },
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataOrganization;
