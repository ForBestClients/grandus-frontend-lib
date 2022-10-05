import useSWR from "swr";
import find from "lodash/find";

export default function useStaticBlock() {
  const { data = null } = useSWR(
    "/api/lib/v1/blocks?expand=customCss,customJavascript&per-page=999",
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const getByHash = async (hash) => {
    return find(data, ["hash", hash]) || {};
  };

  const getBy = async (type, hash) => {
    return find(data, [type, hash]) || {};
  };

  return {
    staticBlocks: data,
    getByHash,
    getBy,
  };
}
