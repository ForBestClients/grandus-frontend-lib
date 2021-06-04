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
import * as yup from "yup";
import { useState } from "react";

const WIDGET_URL = "https://widget.packeta.com/v6/www/js/library.js";
const PICKUP_POINT_TYPE_EXTERNAL = "external";

export const validationScheme = yup.object().shape({
  specificDeliveryType: yup
    .string()
    .nullable()
    .trim()
    .required("Vyberte odberné miesto"),
});

const Packetery = ({ errors, delivery, onSelect }) => {
  const {
    session,
    itemAdd,
    itemRemove,
    isLoading: isSessionStorageLoading,
  } = useSessionStorage();
  const { settings } = useWebInstance();
  const { cart, cartUpdate } = useCart(null, { revalidateOnMount: false });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY)
  );

  const apiKey = get(settings, "packetery_merchant_key");
  if (isEmpty(apiKey)) {
    return null;
  }

  const handlePickupPointSelection = async (selected) => {
    let pickupPointId = get(selected, "id") || null;
    if (get(selected, 'pickupPointId') === PICKUP_POINT_TYPE_EXTERNAL) {
      pickupPointId = get(selected, "carrierId");
    }
    if (pickupPointId !== cart?.specificDeliveryType) {
      setIsLoading(true);
      const updateData = { specificDeliveryType: toString(pickupPointId) };
      if (delivery) {
        updateData.deliveryType = delivery?.id;
      }
      await cartUpdate(
        updateData,
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
      apiKey,
      language: "sk",
      country: "sk",
    });
  };

  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: get(settings, "packetery_widget_settings"),
          }}
        ></script>
        <script src={WIDGET_URL} data-api-key={apiKey}></script>
      </Head>
      <div className={`${styles.packetery} packetery__custom`}>
        {isLoading || isSessionStorageLoading ? (
          'loading'
          // <LoadingOutlined spin />
        ) : (
          <div className={`${styles.selected} packetery__custom--selected`}>
            {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint) ? (
              <p>
                <strong>{get(selectedPickupPoint, "nameStreet", "")}</strong>
                <br />
                {get(selectedPickupPoint, "place", "")}
              </p>
            ) : null}
            <button
              type={!isEmpty(errors?.specificDeliveryType) ? "danger" : null}
              onClick={showModal}
            >
              {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint)
                ? "Zmeniť"
                : "Vybrať odberné miesto"}
            </button>
          </div>
        )}
        {errors?.specificDeliveryType ? (
          <div className={styles?.error} type="danger">
            {errors?.specificDeliveryType}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Packetery;