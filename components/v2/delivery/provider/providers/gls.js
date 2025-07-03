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
import { useCallback, useEffect, useState } from 'react';
import assign from "lodash/assign";
import Script from "next/script";
import Modal from '@/components/_other/modal/Modal';

const WIDGET_URL = "https://plugin.gls-slovakia.sk/v1/";
const PICKUP_POINT_TYPE_EXTERNAL = "external";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY)
  );

  useEffect(() => {
    setSelectedPickupPoint(get(session, DELIVERY_DATA_SESSION_STORAGE_KEY));
  },[session?.deliveryProviderData?.address])

  const closeModal = useCallback(() => {
    if (GlsWidget !== undefined) {
      GlsWidget.close();
    }
    setIsOpen(false);
  }, []);

  const mapApiKey = get(settings, "gls_map_widget_key", 'A13D8A67AC46781E04A04C5D0F3B53EA248088022DD62DA5D800EB3B395B0E61DD88C281F1FF0FCCC276B26B5EA7AE70A9A39BFF2137FD6F1859760C3ADBF975');
  if (isEmpty(mapApiKey)) {
    return null;
  }

  let glsMapWidgetOptions = {
    lang: 'sk',
    renderTo: '#gls-map-container',
    find: 1,
  };

  try {
    glsMapWidgetOptions = JSON.parse(get(settings, "gls_map_widget_settings"));
  } catch (e) {
    // do nothing
  }

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
                "title",
                "address",
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
    closeModal();
  };

  const showModal = () => {
    setIsOpen(true);
  };

  const initGlsMapWidget = () => {
    if (typeof GlsWidget !== 'undefined') {
      const target = document.getElementById('glsWidgetIframe');
      if (target) {
        return;
      }

      GlsWidget.open(handlePickupPointSelection, glsMapWidgetOptions);
    } else {
      console.warn('GlsWidget is not available yet or it was already initialized.');
    }
  }

  return (
    <>
      <Script src={WIDGET_URL + mapApiKey} strategy="afterInteractive" id="gls-map-widget" />
      <div className={`${styles.glsMapWidget} gls-map-widget__custom`}>
        {isLoading || isSessionStorageLoading ? (
          'loading'
          // <LoadingOutlined spin />
        ) : (
          <div className={`${styles.selected} gls-map-widget__custom--selected`}>
            {cart?.specificDeliveryType && !isEmpty(selectedPickupPoint) ? (
              <p>
                <strong>{get(selectedPickupPoint, "address", "")}</strong>
                <br />
                {get(selectedPickupPoint, "title", "")}
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
      <Modal open={isOpen} afterOpen={initGlsMapWidget} onClose={closeModal} className="h-full">
        <div id="gls-map-container" className="relative h-full"></div>
      </Modal>
    </>
  );
};

export default GLS;
