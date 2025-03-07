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
            name: `${get(globalSettings, 'name_of_company')}`,

            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: get(globalSettings, 'phone'),
                contactType: "customer service",
              },
            ],

            address: {
              addressCountry: get(globalSettings, 'state'),
              postalCode: get(globalSettings, 'ZIP'),
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
