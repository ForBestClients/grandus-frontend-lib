import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";

export default async (req, res) => {
  const result = await fetch(
    `${reqApiHost(req)}/api/web-instance?id=${process.env.GRANDUS_TOKEN_HOST}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  res.statusCode = 200;
  res.json(result);
};
