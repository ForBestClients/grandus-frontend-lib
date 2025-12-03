'use client';
import useSWR from 'swr';
import get from 'lodash/get';
import { ESHOP_TYPE_B2C } from 'grandus-lib/constants/AppConstants';
import { getContactFromWebInstance } from 'grandus-lib/utils/contact';

export default function useWebInstance() {
  const { data = null } = useSWR(
    `/api/lib/v1/webinstance`,
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const contact = getContactFromWebInstance(data);

  return {
    webInstance: data,
    domain: get(data, 'domain'),
    settings: get(data, 'globalSettings'),
    eshopType: get(data, 'globalSettings.type_of_shop', ESHOP_TYPE_B2C),
    contact: {
      phone: contact?.phone,
      tel: contact?.phoneNormalized,
      email: contact?.email,
      mailto: contact?.email,
    },
  };
}
