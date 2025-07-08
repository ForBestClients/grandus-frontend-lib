import isEmpty from 'lodash/isEmpty';

const MicroDataFAQ = ({ data }) => {
  if (isEmpty(data)) return null;

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.map(faq => ({
      '@type': 'Question',
      name: faq.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.text.replace(/(<([^>]+)>)/gi, ''), // strip HTML tags
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
    />
  );
};

export default MicroDataFAQ;
