import get from 'lodash/get';

export const getContactFromWebInstance = webInstance => {
  const phone =
    get(webInstance, 'globalSettings.phone', '') ||
    get(webInstance, 'globalSettings.phone_mobile', '') ||
    get(webInstance, 'contact.phone', '');

  const email =
    get(webInstance, 'adminEmail', '') ||
    get(webInstance, 'globalSettings.email', '') ||
    get(webInstance, 'contact.email', '');

  const normalizedPhone = phone ? phone.replace(/\s/g, '') : '';

  return {
    phone,
    phoneNormalized: normalizedPhone,
    email,
  };
};

export default getContactFromWebInstance;
