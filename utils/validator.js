import { startsWith, isEmpty, get } from 'lodash';
import * as yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

yup.addMethod(yup.string, 'validatePhoneNumber', function(message = '') {
  return this.test('validatePhoneNumber', message, function(value) {
      const { path, createError } = this;
      if (!isEmpty(value) && value) {
        const sanitizedValue = !startsWith(value, '+') ? '+' + value : value;
        const phoneNumber = parsePhoneNumberFromString(sanitizedValue);
        if (!phoneNumber) {
          return createError({ path, message });
        }
        return phoneNumber.isValid() || createError({ path, message });
      }
      return true;
  });
});

yup.addMethod(yup.object, 'validateDeliveryTime', function(message = '') {
  return this.test('validateDeliveryTime', message, function(value) {
      const { path, createError } = this;
      if (!_.isEmpty(value)) {
        const isValid =
          !isEmpty(get(value, 'from')) &&
          !isEmpty(get(value, 'to')) &&
          !isEmpty(get(value, 'date')) &&
          get(value, 'slotLengthInMinutes') > 0 &&
          get(value, 'available', false) === true;
        return isValid || createError({ path, message });
      }
      return true;
  });
});

export default yup;