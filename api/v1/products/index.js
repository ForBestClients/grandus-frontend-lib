import { get } from "lodash";
import withSession from "grandus-lib/utils/session";
import {
  reqGetHeaders,
  reqApiHost,
  processQueryFilter,
  getPaginationFromHeaders,
  getProductCardFields,
} from "grandus-lib/utils";
import { pathToParams } from "grandus-lib/hooks/useFilter";

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

    if (get(req, "query.param")) {
      requestBody.param = pathToParams(get(req, "query.param", ""));
    }
  }

  const fields =
    getProductCardFields() +
    (get(req, "query.fields") ? `,${get(req, "query.fields")}` : "");

  let pagination = {};
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
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    })
    .then((r) => get(r, "data", []));

  const data = {
    products: products,
    pagination: pagination,
  };

  res.status(200).json(data);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
