import get from 'lodash/get';

/**
 * Writes a cart selection that involves a delivery, keeping an already chosen
 * payment whenever the backend still allows it.
 *
 * The backend drops the selected payment on every delivery change - even when
 * the payment stays allowed for the new delivery - so the payment has to be
 * re-sent together with the delivery. When it is not allowed there the backend
 * answers 422 and leaves the cart untouched, so the update is repeated without
 * the payment: the delivery still lands and the customer picks a payment again
 * (the checkout refuses to submit without one).
 */
export const updateCartSelection = async ({
  cartUpdate,
  updateData,
  paymentId = null,
}) => {
  const payload = { ...updateData };

  if (paymentId) {
    payload.paymentType = paymentId;
  }

  const result = await cartUpdate(payload);

  if (get(result, 'success') !== false || !payload.paymentType) {
    return result;
  }

  delete payload.paymentType;

  return cartUpdate(payload);
};

/**
 * Pickup point widgets are the only place that writes a delivery on its own -
 * without re-sending the payment the cart ends up with a delivery and no
 * payment, and the order is rejected with "payment method must not be empty".
 */
export const updateDeliverySelection = async ({
  cartUpdate,
  cart,
  delivery,
  specificDeliveryType,
}) => {
  const updateData = { specificDeliveryType };

  if (delivery) {
    updateData.deliveryType = get(delivery, 'id');
  }

  return updateCartSelection({
    cartUpdate,
    updateData,
    // only a delivery change can lose the payment
    paymentId: delivery ? get(cart, 'payment.id') : null,
  });
};

export default updateDeliverySelection;
