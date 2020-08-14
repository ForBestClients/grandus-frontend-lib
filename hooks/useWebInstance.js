import useSWR from "swr";
import { get } from 'lodash'

export default function useWebInstance() {
  const { data = null } = useSWR(
    `/api/v1/webinstance`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );

  return {
    webInstance: data,
    domain: get(data, 'domain'),
    settings: get(data, 'globalSettings'),
  };
}
