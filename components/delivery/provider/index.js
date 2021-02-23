import Packetery from "./providers/packetery";

const PACKETERY_TYPE = 1;

const DeliveryProvider = ({ deliveryProviderType = null }) => {
    if (!deliveryProviderType) {
        return null
    }

    switch (deliveryProviderType) {
        case PACKETERY_TYPE:
            return <Packetery />
        default:
            return null;
    }
}

export default DeliveryProvider;