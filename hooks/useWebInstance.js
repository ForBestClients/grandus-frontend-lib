import useSWR from "swr";
import { get } from "lodash";
import { ESHOP_TYPE_B2C } from "grandus-lib/constants/AppConstants";

export default function useWebInstance() {
  const { data = null } = useSWR(
    `/api/lib/v1/webinstance`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    webInstance: data,
    domain: get(data, "domain"),
    settings: get(data, "globalSettings"),
    eshopType: get(data, "globalSettings.type_of_shop", ESHOP_TYPE_B2C),
    contact: {
      phone: get(data, "globalSettings.phone", ""),
      tel: get(data, "globalSettings.phone", "").replace(/\s/g, ""),
      email: get(data, "adminEmail", ""),
      mailto: get(data, "adminEmail", ""),
    },
  };
}
