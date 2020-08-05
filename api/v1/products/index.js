import { get } from "lodash";
import withSession from "grandus-lib/utils/session";
import {
  reqGetHeaders,
  reqApiHost,
  processQueryFilter,
  forwardPaginationHeaders,
  getProductCardFields,
} from "grandus-lib/utils";

export default withSession(async (req, res) => {
  const requestBody = {
    orderBy: "priority-desc",
  };

  if (get(req, "query")) {
    requestBody.param = processQueryFilter(get(req, "query"));

    if (get(req, "query.category")) {
      requestBody.categoryName = get(req, "query.category", "");
    }

    if (get(req, "query.productIds")) {
      requestBody.productIds = get(req, "query.productIds", []);
    }
  }

  const fields =
    getProductCardFields() +
    (get(req, "query.fields") ? `,${get(req, "query.fields")}` : "");

  const products = await fetch(
    `${reqApiHost(req)}/api/v2/products/filter?fields=${fields}&page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(req, "query.perPage", 3)}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify(requestBody),
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
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
