import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get } from "lodash";

export default withSession(async (req, res) => {
  if (get(req, "query.initial") == 1) {
    const product = await fetch(
      `${reqApiHost(req)}/api/v2/products?urlTitle=${get(req, "query.id")}`,
      {
        headers: reqGetHeaders(req),
      }
    )
      .then((result) => result.json())
      .then((data) => get(data, "data.[0]", {}));

    //normalization of ELASTIC PRODUCT into DB PRODUCT

    const productResult = {
      id: get(product, "id"),
      name: get(product, "name"),
      subtitle: get(product, "subtitle"),
      urlTitle: get(product, "urlTitle"),
      foreignKeyStr: get(product, "foreignKeyStr"),
      // foreignKeyInt: 445462,
      partNo: get(product, "partNo"),
      sku: get(product, "sku"),
      ean: get(product, "ean"),
      new: get(product, "new", false),
      favourite: get(product, "favourite", false),
      // brandId: 581,
      createTime: get(product, "createTime"),
      updateTime: get(product, "updateTime"),
      priority: get(product, "priority", 0),
      // rating: 0,
      // ratingCount: 0,
      // measureUnit: null,
      photo: get(product, "photo", {}),
      // price: "209,00",
      priceData: get(product, "priceData"),
      finalPriceData: get(product, "finalPriceData"),
      standardPriceData: get(product, "standardPriceData"),
      // specialPrice: null,
      VAT: get(product, "VAT"),
      brand: get(product, "brand", {}),
      kind: get(product, "kind", {}),
      availability: get(product, "availability", {}),
      status: get(product, "status", ""),
      storeStatusAvailable: get(product, "storeStatusAvailable"),
      storeStatusUnavailable: get(product, "storeStatusUnavailable"),
      storeStatus: get(product, "storeStatus", {}),
      discount: get(product, "discount"),
      shortProductDescription: {
        description: get(product, "shortDescription"),
        type: 1,
      },
      productDescription: {
        description: get(product, "description"),
        type: 1,
      },
      // advantages: null,
      // disadvantages: null,
      store: get(product, "store"),

      warrantyDuration: get(product, "warrantyDuration"),
      warrantyDurationCompany: get(product, "warrantyDurationCompany"),
      condition: get(product, "condition"),
      // isVariantOf: null,
      variants: get(product, "variants"),
      // priceInfo: { recycle: "0.0400", author: "1.0700" },
      type: get(product, "type"),
      // typeLabel: "Produkt",
      // productSetProducts: [],
      // productPackageProducts: [],
      // canCollectCredits: true,
      active: get(product, "active"),
      isListed: get(product, "isListed"),
      isOrderable: get(product, "isOrderable"),
      externalUrl: get(product, "externalUrl", ""),
      gallery: get(product, "gallery", [])
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(productResult));
    return;
  }

  const product = await fetch(
    `${reqApiHost(req)}/api/v2/products/${get(req, "query.id")}?expand=gallery`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  res.statusCode = get(product, "statusCode", 500);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(product.data));
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
