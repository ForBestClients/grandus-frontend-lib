import useCart from "grandus-lib/hooks/useCart";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import useSessionStorage from "grandus-lib/hooks/useSessionStorage";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import toString from "lodash/toString";
import pick from "lodash/pick";
import isFunction from "lodash/isFunction";

import { DELIVERY_DATA_SESSION_STORAGE_KEY } from "grandus-lib/constants/SessionConstants";

import styles from "./gls.module.scss";
import * as yup from "yup";
import { useCallback, useEffect, useRef, useState } from 'react';
import assign from "lodash/assign";
import Script from "next/script";
import Modal from '@/components/_other/modal/Modal';

const WIDGET_URL = "https://map.gls-slovakia.com/widget/gls-dpm.js";

export const validationScheme = yup.object().shape({
  specificDeliveryType: yup
    .string()
    .nullable()
    .trim()
    .required("Vyberte odberné miesto"),
});

const GLS = ({ errors, delivery, onSelect, config = {} }) => {
  const {
    session,
    itemAdd,
    itemRemove,
    isLoading: isSessionStorageLoading,
  } = useSessionStorage();
  const { settings } = useWebInstance();
  const { cart, cartUpdate } = useCart(null, { revalidateOnMount: false });
  const [isLoading, setIsLoading] = useState(false);
  const glsDialogRef = useRef(null)
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY)
  );

  useEffect(() => {
    setSelectedPickupPoint(get(session, DELIVERY_DATA_SESSION_STORAGE_KEY));
  },[session?.deliveryProviderData?.address])

  let glsMapWidgetOptions = {
    lang: 'sk',
    country: 'sk',
  };

  try {
    glsMapWidgetOptions = JSON.parse(get(settings, "gls_map_widget_settings"));
  } catch (e) {
    // do nothing
  }

  useEffect(() => {
    glsDialogRef.current?.addEventListener('change', async e => {
      await handlePickupPointSelection(e.detail);
    });
  })

  glsMapWidgetOptions = assign(glsMapWidgetOptions, config);

  const handlePickupPointSelection = async (point) => {
    if (!point || !point.id) {
      console.warn("GLS callback received invalid or empty point", point);
      return;
    }

    let pickupPointId = toString(get(point, "id")) || null;
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
              pick(point, [
                "name",
                "contact.address",
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
    glsDialogRef.current.showModal()
  };

  return (
    <>
      <Script src={WIDGET_URL} strategy="afterInteractive" id="gls-map-widget" type="module" />
      <div className={`${styles.glsMapWidget} gls-map-widget__custom`}>
        {isLoading || isSessionStorageLoading ? (
          'loading'
          // <LoadingOutlined spin />
        ) : (
          <div className={`${styles.selected} gls-map-widget__custom--selected`}>
            {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint) ? (
              <p>
                <strong>{get(selectedPickupPoint, "contact.address", "")}</strong>
                <br />
                {get(selectedPickupPoint, "name", "")}
              </p>
            ) : null}
            <button
              type={!isEmpty(errors?.specificDeliveryType) ? "danger" : null}
              onClick={showModal}
            >
              {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint)
                ? get(config, 'text.changePlaceLabel', "Zmeniť")
                :  get(config, 'text.choosePlaceLabel', "Vybrať odberné miesto")}
            </button>
          </div>
        )}
        {errors?.specificDeliveryType ? (
          <div className={styles?.error} type="danger">
            {errors?.specificDeliveryType}
          </div>
        ) : null}
      </div>
      <gls-dpm-dialog {...glsMapWidgetOptions} ref={glsDialogRef} id="gls-map-widget-dialog"></gls-dpm-dialog>
    </>
  );
};

export default GLS;
