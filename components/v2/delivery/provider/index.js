import Packetery, {
    validationScheme as packeteryValidationScheme,
  } from "./providers/packetery";
import GLS, {
  validationScheme as glsValidationScheme,
} from '@/grandus-lib/components/v2/delivery/provider/providers/gls';
import SpsProvider from './providers/SpsProvider';

  export const PACKETERY_TYPE = 1;
  export const GLS_TYPE = 2;
export const SPS_TYPE = 3;

export const getValidationScheme = (deliveryProviderType = null) => {
  if (!deliveryProviderType) {
    return null;
  }

    switch (deliveryProviderType) {
      case PACKETERY_TYPE:
        return packeteryValidationScheme;
      case GLS_TYPE:
        return glsValidationScheme;
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
    case GLS_TYPE:
      return (
        <GLS
          errors={errors}
          onSelect={onSelect}
          delivery={delivery}
          config={options?.gls ?? {}}
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
