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
import Script from 'next/script';

const { Text } = Typography;

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
const GLS = ({ errors, onSelect, options }) => {
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

  const mapApiKey = get(settings, "gls_map_widget_key", 'A13D8A67AC46781E04A04C5D0F3B53EA248088022DD62DA5D800EB3B395B0E61DD88C281F1FF0FCCC276B26B5EA7AE70A9A39BFF2137FD6F1859760C3ADBF975');
  if (isEmpty(mapApiKey)) {
    return null;
  }

  let glsMapWidgetOptions = {
    language: "sk",
    country: "sk",
  };

  try {
    glsMapWidgetOptions = JSON.parse(get(settings, "gls_map_widget_settings"));
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

  const tempCallback = (point) =>{
    console.debug('Číselný identifikátor výdajného miesta: ' + point.id)
    console.debug('Zvolené výdajné miesto: ' + point.title);
    console.debug('Adresa : ' + point.address);
    console.debug('PSČ : ' + point.postalcode);
    console.debug('Parcel locker : ' + point.isparcellocker);
    console.debug('Ulica : ' + point.street);
    console.debug('Mesto : ' + point.city);
    console.debug('Kód krajiny : ' + point.countrycode);
    console.debug('Textový identifikátor výdajného miesta: ' + point.oldId)
    console.debug('Vlastné dáta odovzdané cez encodeVar: ' + point.encodeVar);
    GlsWidget.close();
  }

  const showModal = () => {
    Packeta.Widget.pick(apiKey, handlePickupPointSelection, {
      ...glsMapWidgetOptions
    });
  };

  return (
    <>
      <Script id="gls-map-widget" dangerouslySetInnerHTML={{
        __html: `(function (w, d, i) {
          var f = d.getElementsByTagName('script')[0], j = d.createElement('script');
          j.async = true;
          j.src = 'https://plugin.gls-slovakia.sk/v1/' + i;
          f.parentNode.insertBefore(j, f);
        })(window, document, '${mapApiKey}');`,
      }} />
      <div className={`${styles.packetery} packetery__custom`}>
        <div id="gls-map-container" />
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

export default GLS;
