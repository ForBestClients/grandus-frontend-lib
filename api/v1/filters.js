import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import _, { get } from "lodash";
import { getApiBodyFromPath } from "grandus-lib/hooks/useFilter";

export default async (req, res) => {
  const result = await fetch(
    `${reqApiHost(req)}/api/v2/filters${reqExtractUri(req.url)}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        categoryName: get(req, "query.id", ""),
        ...getApiBodyFromPath(get(req, "query.param", [])),
      }),
    }
  ).then((r) => {
    return r.json();
  });

  res.statusCode = result.statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result.data));
};
