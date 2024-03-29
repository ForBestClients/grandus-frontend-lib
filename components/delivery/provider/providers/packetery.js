import { LoadingOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import useCart from "grandus-lib/hooks/useCart";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import useSessionStorage from "grandus-lib/hooks/useSessionStorage";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import toString from "lodash/toString";
import pick from "lodash/pick";
import isFunction from "lodash/isFunction";
import Head from "next/head";
import { DELIVERY_DATA_SESSION_STORAGE_KEY } from "grandus-lib/constants/SessionConstants";

import styles from "./packetery.module.scss";
import yup from "grandus-lib/utils/validator";
import { useState } from "react";

const { Text } = Typography;

const WIDGET_URL = "https://widget.packeta.com/v6/www/js/library.js";
const PICKUP_POINT_TYPE_EXTERNAL = "external";

/*
Available texts:

options.text : {
  validationScheme : "Vybrať odberné miesto",
}
*/
export const validationScheme = ( options = {}) => yup.object().shape({
  specificDeliveryType: yup
    .string()
    .nullable()
    .trim()
    .required(get(options, "text.validationScheme", "Vyberte odberné miesto"))
});


/*
Available texts:

options.text : {
  choosePlaceLabel : "Vybrať odberné miesto",
  changePlaceLabel : "Zmeniť",
}
 */
const Packetery = ({ errors, onSelect, options }) => {
  const {
    session,
    itemAdd,
    itemRemove,
    isLoading: isSessionStorageLoading,
  } = useSessionStorage();
  const { settings } = useWebInstance();
  const { cart, cartUpdate } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY)
  );

  const apiKey = get(settings, "packetery_merchant_key");
  if (isEmpty(apiKey)) {
    return null;
  }

  let packetaOptions = {
    language: "sk",
    country: "sk",
  };
  
  try {
    packetaOptions = JSON.parse(get(settings, "packetery_widget_settings"));
  } catch (e) {
    // do nothing
  }

  const handlePickupPointSelection = async (selected) => {
    let pickupPointId = get(selected, "id") || null;
    if (get(selected, 'pickupPointId') === PICKUP_POINT_TYPE_EXTERNAL) {
      pickupPointId = get(selected, "carrierId");
    }
    if (pickupPointId !== cart?.specificDeliveryType) {
      setIsLoading(true);
      await cartUpdate(
        { specificDeliveryType: toString(pickupPointId) },
        (newCart) => {
          if (newCart?.specificDeliveryType) {
            itemAdd(
              DELIVERY_DATA_SESSION_STORAGE_KEY,
              pick(selected, [
                "place",
                "nameStreet",
                "url",
                "pickupPointType",
                "carrierPickupPointId",
              ]),
              (sessionData) =>
                setSelectedPickupPoint(
                  get(sessionData, DELIVERY_DATA_SESSION_STORAGE_KEY, null)
                )
            );
          } else {
            itemRemove(DELIVERY_DATA_SESSION_STORAGE_KEY);
            setSelectedPickupPoint(null);
          }
        }
      );
      if (isFunction(onSelect)) {
        onSelect(pickupPointId);
      }
      setIsLoading(false);
    }
  };

  const showModal = () => {
    Packeta.Widget.pick(apiKey, handlePickupPointSelection, {
      ...packetaOptions
    });
  };

  return (
    <>
      <Head>
        <script src={WIDGET_URL} data-api-key={apiKey}></script>
      </Head>
      <div className={`${styles.packetery} packetery__custom`}>
        {isLoading || isSessionStorageLoading ? (
          <LoadingOutlined spin />
        ) : (
          <div className={`${styles.selected} packetery__custom--selected`}>
            {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint) ? (
              <p>
                <strong>{get(selectedPickupPoint, "nameStreet", "")}</strong>
                <br />
                {get(selectedPickupPoint, "place", "")}
              </p>
            ) : null}
            <Button
              type={!isEmpty(errors?.specificDeliveryType) ? "danger" : null}
              onClick={showModal}
            >
              {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint)
                ? get(options, 'text.changePlaceLabel', "Zmeniť")
                : get(options, 'text.choosePlaceLabel', "Vybrať odberné miesto")}
            </Button>
          </div>
        )}
        {errors?.specificDeliveryType ? (
          <Text className={styles?.error} type="danger">
            {errors?.specificDeliveryType}
          </Text>
        ) : null}
      </div>
    </>
  );
};

export default Packetery;
