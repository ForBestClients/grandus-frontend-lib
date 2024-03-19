import Packetery, {
    validationScheme as packeteryValidationScheme,
  } from "./providers/packetery";

  export const PACKETERY_TYPE = 1;

  export const getValidationScheme = (deliveryProviderType = null) => {
    if (!deliveryProviderType) {
      return null;
    }

    switch (deliveryProviderType) {
      case PACKETERY_TYPE:
        return packeteryValidationScheme;
      default:
        return null;
    }
  };

  const DeliveryProvider = ({
    deliveryProviderType = null,
    delivery = null,
    errors = null,
    onSelect = null,
    options = {},
  }) => {
    if (!deliveryProviderType) {
      return null;
    }

    switch (deliveryProviderType) {
      case PACKETERY_TYPE:
        return <Packetery errors={errors} onSelect={onSelect} delivery={delivery} config={options?.packetery ?? {}}/>;
      default:
        return null;
    }
  };

  export default DeliveryProvider;