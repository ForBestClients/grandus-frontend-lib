export const LETTERS_ONLY_REGEX =
  /^([\s]|[a-zA-Z\-]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u01FF]|[\u0200-\u02AF]|[\u0300-\u036F]|[\u1E00-\u1EFF]|[\u2160-\u2188]){2,100}$/i;

export const BUSINESS_ID_REGEX = /^[0-9]{1,8}$/i;
export const BUSINESS_ID_REGEX_HU = /^[0-9]{2}-[0-9]{2}-[0-9]{6}$/i;
export const BUSINESS_ID_REGEX_RO =
  /^[a-zA-Z]{1}[0-9]{2}\/[0-9]{3,4}\/[0-9]{4}$/i;

export const VAT_ID_REGEX = /^[0-9]{1,10}$/i;
export const VAT_ID_REGEX_HU = /^[0-9]{8}-[0-9]{1}-[0-9]{2}$/i;

export const VAT_NUMBER_REGEX = /^[a-zA-Z]{2}[0-9]{8,10}$/i;
export const VAT_NUMBER_REGEX_HU = /^[a-zA-Z]{2}[0-9]{8}$/i;
export const VAT_NUMBER_REGEX_RO = /^[a-zA-Z]{2}[0-9]{2,10}$/i;

export const ZIP_REGEX = /^[0-9\s]{4,10}$/i;
export const STREET_REGEX =
  /^([\s]|[a-zA-Z0-9\-\.\,\\/]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u01FF]|[\u0200-\u02AF]|[\u0300-\u036F]|[\u1E00-\u1EFF]|[\u2160-\u2188]|){2,100} ([0-9\/]+)([a-zA-Z-]{0,3})$/i;

export const CARD_NO_REGEX = /^[a-zA-Z]{2}[0-9\s]{6}$/i;
