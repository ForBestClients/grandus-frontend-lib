import split from 'lodash/split';
import indexOf from 'lodash/indexOf';

const disabledUriParts = split(
  process.env.GRANDUS_RESERVED_URI_PARTS_DISABLE,
  ',',
);

//RESERVED URL PARTS
let parts = [];

if (
  indexOf(disabledUriParts, 'priceFrom') < 0 ||
  indexOf(disabledUriParts, 'priceTo') < 0
) {
  parts.push({
    key: ['priceFrom', 'priceTo'],
    urlTitle: 'cena',
    title: 'Cena', //@todo translation
    priority: 1,
    hash: 'price',
  });
}

if (indexOf(disabledUriParts, 'storeLocation') < 0) {
  parts.push({
    key: 'storeLocation',
    urlTitle: 'predajna',
    title: 'Predajňa', //@todo translation
    priority: 2,
  });
}

if (indexOf(disabledUriParts, 'availability') < 0) {
  parts.push({
    key: 'availability',
    urlTitle: 'dostupnost',
    title: 'Dostupnosť', //@todo translation
    priority: 3,
  });
}

if (indexOf(disabledUriParts, 'condition') < 0) {
  parts.push({
    key: 'condition',
    urlTitle: 'trieda',
    title: 'Trieda', //@todo translation
    priority: 4,
  });
}

if (indexOf(disabledUriParts, 'brand') < 0) {
  parts.push({
    //TODO fix bug with undefined
    key: 'brand',
    urlTitle: 'vyrobca',
    title: 'Výrobca', //@todo translation
    priority: 5,
  });
}

if (indexOf(disabledUriParts, 'status') < 0) {
  parts.push({
    key: 'status',
    urlTitle: 'stav',
    title: 'Status', //@todo translation
    priority: 6,
  });
}

if (indexOf(disabledUriParts, 'store') < 0) {
  parts.push({
    key: 'store',
    urlTitle: 'velkost',
    title: 'Veľkosť', //@todo translation
    priority: 7,
  });
}

if (indexOf(disabledUriParts, 'tags') < 0) {
  parts.push({
    key: 'tags',
    urlTitle: 'tag',
    title: 'Tag', //@todo translations
    priority: 8,
  });
}

if (indexOf(disabledUriParts, 'storeLocationTown') < 0) {
  parts.push({
    key: 'storeLocationTown',
    urlTitle: 'mesto',
    title: 'Mesto', //@todo translation
    priority: 9,
  });
}

if (indexOf(disabledUriParts, 'storeLocationDistrict') < 0) {
  parts.push({
    key: 'storeLocationDistrict',
    urlTitle: 'okres',
    title: 'Okres', //@todo translation
    priority: 10,
  });
}

export const RESERVED_URI_PARTS = [...parts];
