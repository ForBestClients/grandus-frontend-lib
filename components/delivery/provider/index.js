import Packetery, { validationScheme as packeteryValidationScheme } from "./providers/packetery";
import get from "lodash/get";

export const PACKETERY_TYPE = 1;

/*
getValidationScheme can handle options
options.text : {
    Packetery : {
        validationScheme : "Vyberte odberné miesto"
    }
}
 */
export const getValidationScheme = (deliveryProviderType = null, options) => {
    if (!deliveryProviderType) {
        return null
    }

    switch (deliveryProviderType) {
        case PACKETERY_TYPE:
            return packeteryValidationScheme(get(options, 'text.Packetery.validationScheme', "Vyberte odberné miesto"));
        default:
            return null;
    }
}

/*
Delivery provider can handle options

If key in options are from these available:
 - Packetery
will be processed to that component

options : {
    Packetery : {
        ...
    }
}
 */
const DeliveryProvider = ({ deliveryProviderType = null, errors = null, onSelect = null , options }) => {
    if (!deliveryProviderType) {
        return null
    }

    switch (deliveryProviderType) {
        case PACKETERY_TYPE:
            return <Packetery errors={errors} onSelect={onSelect} options={get(options, 'Packetery', {})}/>
        default:
            return null;
    }
}

export default DeliveryProvider;