import Packetery, {
  validationScheme as packeteryValidationScheme,
} from './providers/packetery';
import SpsProvider from './providers/SpsProvider';

export const PACKETERY_TYPE = 1;
export const SPS_TYPE = 3;

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
      return (
        <Packetery
          errors={errors}
          onSelect={onSelect}
          delivery={delivery}
          config={options?.packetery ?? {}}
        />
      );
    case SPS_TYPE:
      return (
        <SpsProvider
          errors={errors}
          onSelect={onSelect}
          delivery={delivery}
          config={options?.sps ?? {}}
        />
      );
    default:
      return null;
  }
};

export default DeliveryProvider;
