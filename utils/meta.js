import truncate from 'lodash/truncate';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import get from 'lodash/get';

import { getImageUrl } from 'grandus-lib/utils';

const TITLE_LENGTH_MAX = 60;
const DESCRIPTION_LENGTH_MAX = 155;

export const adjustTitle = (
  title,
  branding = '',
  suffix = '',
  prefix = '',
  options = { maxLength: TITLE_LENGTH_MAX, omission: '' },
) => {
  let result = isEmpty(title) ? '' : trim(title, ' ');

  const MAX_LENGTH = options?.maxLength ? options.maxLength : TITLE_LENGTH_MAX;

  if (result.length <= MAX_LENGTH - suffix.length + 1 && !isEmpty(suffix)) {
    result = result + (result ? ' ' : '') + suffix.toString();
  }

  if (result.length <= MAX_LENGTH - branding.length + 1 && !isEmpty(branding)) {
    result = result + (result ? ' ' : '') + branding.toString();
  }

  if (result.length <= MAX_LENGTH - prefix.length + 1 && !isEmpty(prefix)) {
    result = prefix + (result ? ' ' : '') + result.toString();
  }

  if (result.length > MAX_LENGTH) {
    result = truncate(title, {
      length: MAX_LENGTH,
      omission: options?.omission ? options?.omission : '',
    });
  }

  return result;
};

export const adjustDescription = (content, prefix, suffix, branding) => {
  return adjustTitle(content, prefix, suffix, branding, {
    maxLength: DESCRIPTION_LENGTH_MAX,
    omission: '...',
  });
};

export const getMetaData = (
  title,
  description,
  branding = '',
  photo,
  options,
) => {
  const metaTitle = title
    ? adjustTitle(
        title,
        get(options, 'title.branding', branding),
        get(options, 'title.suffix'),
        get(options, 'title.prefix'),
        {
          maxLength: get(options, 'title.maxLength'),
        },
      )
    : false;

  const metaDescription = description
    ? adjustDescription(
        description,
        get(options, 'description.branding'),
        get(options, 'description.suffix'),
        get(options, 'description.prefix'),
      )
    : false;

  const metaDataGeneral = {
    referrer: 'origin-when-cross-origin',
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
  };
  const metaDataOg = {
    type: 'website',
  };

  if (metaTitle) {
    metaDataOg.title = metaTitle;
    metaDataGeneral.title = metaTitle;
  }

  if (metaDescription) {
    metaDataOg.description = metaDescription;
    metaDataGeneral.description = metaDescription;
  }

  if (options?.keywords) {
    metaDataGeneral.keywords = options?.keywords;
    metaDataOg.keywords = options?.keywords;
  }

  if (options?.themeColor) {
    metaDataGeneral.themeColor = options?.themeColor;
  }

  if (options?.colorScheme) {
    metaDataGeneral.colorScheme = options?.colorScheme;
  }

  if (options?.authors) {
    metaDataGeneral.authors = options?.authors;
    metaDataGeneral.authors.push({
      name: 'For Best Clients, s.r.o.',
      url: 'https://www.forbestclients.com',
    });
  } else {
    metaDataGeneral.authors = [
      {
        name: 'For Best Clients, s.r.o.',
        url: 'https://www.forbestclients.com',
      },
    ];
  }

  if (branding) {
    metaDataGeneral.generator = branding;
    metaDataGeneral.applicationName = branding;
    metaDataOg.siteName = branding;
  }

  if (options?.icons) {
    metaDataGeneral.icons = options.icons;
  }

  if (photo?.path || options?.image) {
    const imageData = {
      url: get(
        options,
        'image.url',
        getImageUrl(photo, get(options, 'image.dimensions', '1200x630'), 'jpg'),
      ),
    };

    if (get(options, 'image.width') !== -1) {
      imageData.width = get(options, 'image.width', 1200);
    }

    if (get(options, 'image.height') !== -1) {
      imageData.height = get(options, 'image.height', 630);
    }

    metaDataOg.images = [imageData];
  }

  const alternates = {
    canonical: get(options, 'alternates.canonical', '/'),
  };

  return {
    ...metaDataGeneral,
    openGraph: metaDataOg,
    alternates: alternates,
  };
};
