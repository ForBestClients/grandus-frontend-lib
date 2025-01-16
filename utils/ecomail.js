import map from 'lodash/map';
import { getImageUrl } from 'grandus-lib/utils';
import forEach from 'lodash/forEach';
import isFunction from 'lodash/isFunction';

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
    const products = map(cart?.items, item => {
      return {
        productId: item?.product?.id,
        img_url: getImageUrl(item?.product?.photo, '200x200', 'png'),
        url: `${process.env.NEXT_PUBLIC_HOST}/produkt/${item?.product?.urlTitle}`,
        name: item?.product?.name,
        price: item?.product?.priceData?.price,
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

  addTrans: function (order) {
    this.track(
      'addTrans',
      order?.id,
      'Murat',
      order?.totalSumData?.priceFormatted,
      `${order?.totalSumData?.vatFraction} ${order?.totalSumData?.currencySymbol}`,
      order?.deliveryPriceData?.priceFormatted,
      order?.city,
      'SK',
    );
  },

  addItems: function (order) {
    forEach(order?.orderItems, item => {
      this.addItem(order?.id, item);
    });
  },

  addItem: function (cartId, item) {
    this.track(
      'addItem',
      cartId,
      item?.product?.sku ? item?.product?.sku : item?.product?.id,
      item?.name,
      item?.product?.kind?.name,
      item?.unitPriceData?.priceFormatted,
      item?.count,
    );
  },

  trackTrans: function () {
    this.track('trackTrans');
  },

  trackPageView: function () {
    this.track('trackPageView');
  },

  trackOrder: function (order) {
    this.addTrans(order);
    this.addItems(order);
    this.trackTrans();
  },
};

export default EcoMail;
