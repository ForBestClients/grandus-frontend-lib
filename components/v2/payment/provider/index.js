import Besteron from "./providers/Besteron";

export const DEFAULT_TYPE = 0;
export const CASH_ON_DELIVERY_TYPE = 1;
export const BESTERON_TYPE = 2;

const PaymentProvider = ({
  payment = null,
  updateCart = true,
  handleChange,
  options = {}
}) => {
  if (!payment) {
    return null;
  }

  switch (payment?.type) {
    case BESTERON_TYPE:
      return (
        <Besteron
          payment={payment}
          updateCart={updateCart}
          handleChange={handleChange}
          options={options}
        />
      );
    default:
      return null;
  }
};

export default PaymentProvider;