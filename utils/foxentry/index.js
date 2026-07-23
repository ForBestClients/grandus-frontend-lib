/**
 * Foxentry integration (data validation & autocomplete) for Grandus projects.
 *
 * Layout:
 *   client.js   — client-safe flag + resilient fetch helper
 *   server.js   — server-only request helper (holds the API key)
 *   handlers/   — API route handlers (company, address, email, phone)
 *   useFoxentryContactValidation.js — email/phone validation hook + hint builders
 *
 * The project wires thin App-Router route files to these handlers and keeps
 * its own presentational components (which depend on project-level inputs).
 */

export {
  isFoxentryEnabled,
  isFoxentryJsEnabled,
  getFoxentryJsProjectId,
  fetchFoxentryJson,
} from './client';
export { isFoxentryServerEnabled, foxentryRequest } from './server';

export {
  handleCompanyAutocomplete,
  handleCompanySearch,
} from './handlers/company';
export { handleAddressAutocomplete } from './handlers/address';
export { handleEmailValidate } from './handlers/email';
export { handlePhoneValidate } from './handlers/phone';

export {
  default as useFoxentryContactValidation,
  getEmailHint,
  getPhoneHint,
} from './useFoxentryContactValidation';

export { default as useFoxentryAutocomplete } from './useFoxentryAutocomplete';

export { SUPPORTED_COUNTRIES, MIN_QUERY_LENGTH } from './constants';
