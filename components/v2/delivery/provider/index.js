import Packetery, {
    validationScheme as packeteryValidationScheme,
  } from "./providers/packetery";
import GLS, {
  validationScheme as glsValidationScheme,
} from '@/grandus-lib/components/v2/delivery/provider/providers/gls';

  export const PACKETERY_TYPE = 1;
  export const GLS_TYPE = 2;

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
        return <Packetery errors={errors} onSelect={onSelect} delivery={delivery} config={options?.packetery ?? {}} />;
      case GLS_TYPE:
        return <GLS errors={errors} onSelect={onSelect} delivery={delivery} config={options?.gls ?? {}}/>;
      default:
        return null;
    }
  };

  export default DeliveryProvider;
