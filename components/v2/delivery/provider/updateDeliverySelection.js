import get from 'lodash/get';

/**
 * Saves the picked pickup point together with its delivery.
 *
 * The backend drops the selected payment on every delivery change - even when
 * the payment stays allowed for the new delivery. Pickup point widgets are the
 * only place that writes a delivery on its own, so without re-sending the
 * payment the cart silently ends up with a delivery and no payment and the
 * order is rejected later with "payment method must not be empty".
 *
 * When the payment is not allowed for the newly picked delivery the backend
 * answers 422 and keeps the cart untouched - the update is then repeated
 * without the payment so at least the delivery and the pickup point are saved
 * and the customer can pick a payment again.
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

    const selectedPaymentId = get(cart, 'payment.id');
    if (selectedPaymentId) {
      updateData.paymentType = selectedPaymentId;
    }
  }

  const result = await cartUpdate(updateData);

  if (get(result, 'success') !== false || !updateData.paymentType) {
    return result;
  }

  delete updateData.paymentType;

  return cartUpdate(updateData);
};

export default updateDeliverySelection;
