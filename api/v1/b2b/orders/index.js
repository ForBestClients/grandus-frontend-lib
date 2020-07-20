import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const banners = await fetch(`${reqApiHost(req)}/api/v2/users/5278/orders`, {
    headers: reqGetHeaders(req),
  }).then((result) => result.json());

  res.statusCode = banners.statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(banners.data));
};
