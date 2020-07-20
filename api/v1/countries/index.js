import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const result = await fetch(
    `${reqApiHost(req)}/api/v2/countries`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((r) => r.json());

  res.statusCode = result.statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result.data));
};
