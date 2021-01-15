import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import useCart from "grandus-lib/hooks/useCart";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import useSessionStorage from "grandus-lib/hooks/useSessionStorage";
import { isEmpty, get, toString, pick } from "lodash";
import Head from "next/head";
import { DELIVERY_DATA_SESSION_STORAGE_KEY } from "grandus-lib/constants/SessionConstants";

import styles from "./packetery.module.scss";

const WIDGET_URL = "https://widget.packeta.com/www/js/library.js";

const Packetery = () => {
  const { session, itemAdd, itemRemove, isLoading: isSessionStorageLoading } = useSessionStorage();
  const { settings } = useWebInstance();
  const { cart, cartUpdate } = useCart();
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedPickupPoint = get(session, DELIVERY_DATA_SESSION_STORAGE_KEY);

  const apiKey = get(settings, "packetery_merchant_key");
  if (isEmpty(apiKey)) {
    return null;
  }

  const handlePickupPointSelection = async (selected) => {
    const pickupPointId = get(selected, "id") || null;
    if (pickupPointId !== cart?.specificDeliveryType) {
      setIsLoading(true);
      await cartUpdate(
        { specificDeliveryType: toString(pickupPointId) },
        (newCart) => {
          if (newCart?.specificDeliveryType) {
            itemAdd(DELIVERY_DATA_SESSION_STORAGE_KEY, pick(selected, ['place', 'nameStreet', 'url']));
          } else {
            itemRemove(DELIVERY_DATA_SESSION_STORAGE_KEY);
          }
        }
      );
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
      <div className={styles.packetery}>
        {isLoading || isSessionStorageLoading ? (
          <LoadingOutlined spin />
        ) : (
          <div className={styles.selected}>
            {!isEmpty(selectedPickupPoint) ? (
              <p>
                <strong>{get(selectedPickupPoint, "nameStreet", "")}</strong>
                <br />
                {get(selectedPickupPoint, "place", "")}
              </p>
            ) : null}
            <Button onClick={showModal}>
              {!isEmpty(selectedPickupPoint)
                ? "Zmeniť"
                : "Vybrať odberné miesto"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Packetery;
