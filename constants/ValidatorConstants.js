export const LETTERS_ONLY_REGEX = /^([\s]|[a-zA-Z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u01FF]|[\u0200-\u02AF]|[\u0300-\u036F]|[\u1E00-\u1EFF]|[\u2160-\u2188]){2,100}$/i;
export const BUSINESS_ID_REGEX = /^[0-9]{1,12}$/i;
export const VAT_NUMBER_REGEX = /^[a-zA-Z]{2}[0-9]{8,10}$/i;
export const ZIP_REGEX = /^[0-9]{4,10}$/i;