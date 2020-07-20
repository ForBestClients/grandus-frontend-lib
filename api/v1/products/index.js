import _, { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost,
  processQueryFilter,
  forwardPaginationHeaders,
} from "grandus-lib/utils";

const fields = "fields=id,name,urlTitle,storeStatus,finalPriceData,photo";

export default async (req, res) => {
  const products = await fetch(
    `${reqApiHost(req)}/api/v2/products/filter?${fields}&page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(req, "query.perPage", 3)}&orderBy=${get(
      req,
      "query.orderBy",
      "time-desc"
    )}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        categoryName: get(req, "query.category", ""),
        param: processQueryFilter(get(req, "query")),
        orderBy: "time-desc",
      }),
    }
  )
    .then((result) => {
      forwardPaginationHeaders(res, result.headers);
      return result.json();
    })
    .then((r) => r.data);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(products));
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
