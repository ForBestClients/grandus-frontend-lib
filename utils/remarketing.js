import map from "lodash/map";

const TYPE_RETAIL = "retail";

const Remarketing = {
  viewSearchResults: (products) => {
    const data = {
      items: products.map((product) => ({
        id: product?.id,
        google_business_vertical: TYPE_RETAIL,
      })),
    };
    return prepareData(data, "view_search_results");
  },
  viewItemList: (products) => {
    const data = {
      items: products.map((product) => ({
        id: product?.id,
        google_business_vertical: TYPE_RETAIL,
      })),
    };
    return prepareData(data, "view_item_list");
  },
  viewItem: (product) => {
    const data = {
      value: product?.finalPriceData?.price,
      currency: product?.finalPriceData?.currency,
      items: [{ id: product?.id, google_business_vertical: TYPE_RETAIL }],
    };

    return prepareData(data, "view_item");
  },
  addToCart: (product) => {
    const data = {
      value: product?.finalPriceData?.price,
      currency: product?.finalPriceData?.currency,
      items: [{ id: product?.id, google_business_vertical: TYPE_RETAIL }],
    };

    return prepareData(data, "add_to_cart");
  },
  purchase: (order) => {
    const items = order?.orderItems || [];
    const data = {
      value: parseFloat(order?.totalSumData?.price || 0),
      currency: order?.totalSumData?.currency,
      items: map(items, (item) => ({
        id: item?.productId,
        google_business_vertical: TYPE_RETAIL,
      })),
    };

    return prepareData(data, "purchase");
  },
};

const prepareData = (data = {}, event = null) => {
  let remarketingJson = {};
  if (event) {
    remarketingJson.event = event;
  }

  if (data) {
    remarketingJson = { ...remarketingJson, ...data };
  }

  return remarketingJson;
};

export default Remarketing;
