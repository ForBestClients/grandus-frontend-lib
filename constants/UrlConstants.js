//RESERVED URL PARTS
export const RESERVED_URI_PARTS = [
  {
    key: ['priceFrom', 'priceTo'],
    urlTitle: 'cena',
    title: 'Cena', //@todo translation
    priority: 1,
    hash: 'price',
  },
  {
    key: 'storeLocation',
    urlTitle: 'predajna',
    title: 'Predajňa', //@todo translation
    priority: 2,
  },
  {
    key: 'availability',
    urlTitle: 'dostupnost',
    title: 'Dostupnosť', //@todo translation
    priority: 3,
  },
  {
    key: 'condition',
    urlTitle: 'trieda',
    title: 'Trieda', //@todo translation
    priority: 4,
  },
  {
    //TODO fix bug with undefined
    key: 'brand',
    urlTitle: 'vyrobca',
    title: 'Výrobca', //@todo translation
    priority: 5,
  },
  {
    key: 'status',
    urlTitle: 'stav',
    title: 'Status', //@todo translation
    priority: 6,
  },
  {
    key: 'store',
    urlTitle: 'velkost',
    title: 'Veľkosť', //@todo translation
    priority: 7,
  },
  {
    key: 'tags',
    urlTitle: 'tag',
    title: 'Tag', //@todo translations
    priority: 8,
  },
  {
    key: 'storeLocationTown',
    urlTitle: 'mesto',
    title: 'Mesto', //@todo translation
    priority: 9,
  },
  {
    key: 'storeLocationDistrict',
    urlTitle: 'okres',
    title: 'Okres', //@todo translation
    priority: 10,
  },
];
