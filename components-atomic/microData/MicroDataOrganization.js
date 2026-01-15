import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import { getImageUrl } from '../../utils';


const getSameAs = globalSettings => {
  const sameAs = [];
  if (get(globalSettings, 'facebook_link')) {
    sameAs.push(get(globalSettings, 'facebook_link'));
  }
  if (get(globalSettings, 'instagram_link')) {
    sameAs.push(get(globalSettings, 'instagram_link'));
  }
  if (get(globalSettings, 'youtube_link')) {
    sameAs.push(get(globalSettings, 'youtube_link'));
  }
  if (get(globalSettings, 'twitter_link')) {
    sameAs.push(get(globalSettings, 'twitter_link'));
  }
  if (get(globalSettings, 'google_link')) {
    sameAs.push(get(globalSettings, 'google_link'));
  }

  return sameAs;
}

const MicroDataOrganization = ({ webInstance = null }) => {
  if (!isEmpty(webInstance)) {
    const { domain = null, logo = null, logoInverse = null, globalSettings } = webInstance;
    const organizationlogo = logo || logoInverse;

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Organization",
            url: `${domain}`,
            name: `${get(globalSettings, 'name_of_company')}`,
            logo: organizationlogo ? [getImageUrl(organizationlogo, '250x250', 'png')] : [],
            sameAs: getSameAs(globalSettings),
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: get(globalSettings, 'phone'),
                contactType: "customer service",
              },
            ],

            address: {
              "@type": "PostalAddress",
              streetAddress: get(globalSettings, 'street_and_number'),
              addressLocality: get(globalSettings, 'city'),
              postalCode: get(globalSettings, 'ZIP'),
              addressCountry: get(globalSettings, 'state'),
            },
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataOrganization;
