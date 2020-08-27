import { get } from "lodash";
import {
  reqGetHeaders,
  reqApiHost,
  getPaginationFromHeaders,
} from "grandus-lib/utils";

export default async (req, res) => {
  let pagination = {};
  const operationUnits = await fetch(
    `${reqApiHost(req)}/api/v2/operation-units?page=${get(
      req,
      "query.page",
      1
    )}&per-page=${get(
      req,
      "query.perPage",
      process.env.NEXT_PUBLIC_PRODUCT_DEFAULT_PER_PAGE
    )}&expand=openingHours`,
    {
      method: "get",
      headers: reqGetHeaders(req),
    }
  )
    .then((result) => {
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    })
    .then((r) => get(r, "data", []));

  const data = {
    operationUnits: operationUnits,
    pagination: pagination,
  };

  res.status(200).json(data);
};
