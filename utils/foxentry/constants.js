/**
 * Shared Foxentry constants.
 */

/** Countries Foxentry location/company search is filtered to (ISO-2). */
export const SUPPORTED_COUNTRIES = ['SK', 'CZ', 'PL'];

/** Minimum query length before an autosuggest request is issued. */
export const MIN_QUERY_LENGTH = 3;

/** Hard cap on a query string forwarded to Foxentry (defensive input bound). */
export const MAX_QUERY_LENGTH = 100;
