import useSWR from 'swr';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';

const useStaticBlock = (options = {}) => {
  let uri = [];

  if (options?.hash) {
    uri.push('hash=' + options?.hash);
  }

  if (options?.group) {
    uri.push('group=' + options?.group);
  }

  if (options?.fields) {
    uri.push('fields=' + options?.fields);
  }

  if (options?.perPage !== false) {
    uri.push('per-page=' + (options?.perPage ? options?.perPage : '999'));
  }

  if (options?.expand !== false) {
    uri.push(
      'expand=' +
        (options?.expand ? options?.expand : 'customCss,customJavascript'),
    );
  }

  console.log(
    'old',
    '/api/lib/v1/blocks?expand=customCss,customJavascript&per-page=999',
  );
  console.log(
    'new',
    '/api/lib/v1/blocks' + (isEmpty(uri) ? '' : '?' + join(uri, '&')),
  );

  const { data = null, isValidating } = useSWR(
    '/api/lib/v1/blocks' + (isEmpty(uri) ? '' : '?' + join(uri, '&')),
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const getByHash = async hash => {
    return find(data, ['hash', hash]) || {};
  };

  const getBy = async (type, hash) => {
    return find(data, [type, hash]) || {};
  };

  return {
    staticBlocks: data,
    isValidating,
    getByHash,
    getBy,
  };
};

export default useStaticBlock;
