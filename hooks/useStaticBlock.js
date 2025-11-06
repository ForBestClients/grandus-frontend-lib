import useSWR from 'swr';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';

const useStaticBlock = (options = {}) => {
  const {
    hash,
    group,
    fields,
    perPage,
    expand,
    initialData = null,
    swrConfig = {},
  } = options;

  const uri = [];

  if (hash) {
    uri.push('hash=' + hash);
  }

  if (group) {
    uri.push('group=' + group);
  }

  if (fields) {
    uri.push('fields=' + fields);
  }

  if (perPage !== false) {
    uri.push('per-page=' + (perPage ? perPage : '999'));
  }

  if (expand !== false) {
    uri.push('expand=' + (expand ? expand : 'customCss,customJavascript'));
  }

  const swrKey =
    '/api/lib/v1/blocks' + (isEmpty(uri) ? '' : '?' + join(uri, '&'));

  const baseConfig = {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  };

  if (initialData !== null) {
    baseConfig.fallbackData = initialData;
    baseConfig.revalidateOnMount = false;
  }

  const { data = initialData ?? null, isValidating } = useSWR(
    swrKey,
    url => fetch(url).then(r => r.json()),
    {
      ...baseConfig,
      ...swrConfig,
    },
  );

  const resolvedData = data ?? initialData ?? null;

  const getByHash = hashValue => {
    return find(resolvedData, ['hash', hashValue]) || {};
  };

  const getBy = async (type, hashValue) => {
    return find(resolvedData, [type, hashValue]) || {};
  };

  return {
    staticBlocks: resolvedData,
    isValidating,
    getByHash,
    getBy,
  };
};

export default useStaticBlock;
