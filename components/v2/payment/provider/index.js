import Besteron from "./providers/Besteron";

const DEFAULT_TYPE = 0;
const CASH_ON_DELIVERY_TYPE = 1;
const BESTERON_TYPE = 2;

const PaymentProvider = ({
  payment = null,
  updateCart = true,
  handleChange,
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
        />
      );
    default:
      return null;
  }
};

export default PaymentProvider;