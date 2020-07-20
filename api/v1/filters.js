import {
  reqExtractUri,
  reqGetHeaders,
  reqApiHost,
  processQueryFilter,
} from "grandus-lib/utils";
import _, { get } from "lodash";

export default async (req, res) => {
  const result = await fetch(
    `${reqApiHost(req)}/api/v2/filters${reqExtractUri(req.url)}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        categoryName: get(req, "query.id", ""), //'mobilne-telefony',//get(req, 'query.category'),
        param: processQueryFilter(get(req, "query", {})),
        //   page: 1,
        //   perPage: 1,
        //   orderBy: 'time-desc'
      }),
    }
  ).then((r) => r.json());

  res.statusCode = result.statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result.data));
};
