import map from 'lodash/map';
import { getImageUrl } from 'grandus-lib/utils';
import forEach from 'lodash/forEach';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

const EcoMail = {
  isEnabled: function () {
    return !!window.ecotrack;
  },

  track: function (event, ...data) {
    if (this.isEnabled()) {
      window.ecotrack(event, ...data);
    }
  },

  setUserId: function (email) {
    this.track('setUserId', email);
  },

  unStructEvent: function (cart, callback) {
    const includeCartUrl = process.env.NEXT_PUBLIC_INCLUDE_CART_URL_IN_ECOMAIL === 'true';
  
    const externalCartLink = map(cart?.items, item => {
      const externalId = item?.product?.ean || item?.product?.id;
      const quantity = item?.count;
      return `${externalId}${quantity > 1 ? `|||${quantity}` : ''}`;
    }).join(',');

    const fullCartUrl = `${process.env.NEXT_PUBLIC_HOST}/kosik/externe/${externalCartLink}`;
  
    const products = map(cart?.items, item => {
      return {
        productId: item?.product?.id,
        img_url: getImageUrl(item?.product?.photo, '200x200', 'png'),
        url: includeCartUrl
          ? fullCartUrl 
          : `${process.env.NEXT_PUBLIC_HOST}/produkt/${item?.product?.urlTitle}`, 
        name: item?.product?.name,
        price: item?.product?.finalPriceData?.price,
        description: item?.product?.shortProductDescription?.description,
        quantity: item?.count,
      };
    });
  
    this.track('trackUnstructEvent', {
      schema: '',
      data: {
        action: 'Basket',
        products: products.length ? products : [],
      },
    });
  
    if (isFunction(callback)) {
      callback();
    }
  },

  addTrans: function (order, shopName = '') {
    this.track(
      'addTrans',
      order?.id,
      shopName,
      order?.totalSumData?.priceFormatted,
      `${order?.totalSumData?.vatFraction} ${order?.totalSumData?.currencySymbol}`,
      order?.deliveryPriceData?.priceFormatted,
      order?.city,
      'SK',
    );
  },

  addItems: function (order, key = 'sku') {
    forEach(order?.orderItems, item => {
      this.addItem(order?.id, item, key);
    });
  },

  addItem: function (orderId, item, itemKey = 'sku') {
    console.log([
      'addItem',
      orderId,
      get(item, `product.${itemKey}`, get(item, 'product.id', 'discount')),
      get(item, 'name'),
      get(item, 'product.kind.name', 'discount'),
      get(item, 'totalPriceData.price', 0),
      get(item, 'count', 1),
    ]);

    this.track(
      'addItem',
      orderId,
      get(item, `product.${itemKey}`, get(item, 'product.id', 'discount')),
      get(item, 'name'),
      get(item, 'product.kind.name', 'discount'),
      get(item, 'priceData.price', 0),
      get(item, 'count', 1),
    );
  },

  trackTrans: function () {
    this.track('trackTrans');
  },

  trackPageView: function () {
    this.track('trackPageView');
  },

  trackOrder: function (order, shopName = '', key = 'sku') {
    this.addTrans(order, shopName);
    this.addItems(order, key);
    this.trackTrans();
  },
};

export default EcoMail;
