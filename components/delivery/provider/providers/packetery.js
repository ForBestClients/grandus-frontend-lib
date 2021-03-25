import { LoadingOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import useCart from "grandus-lib/hooks/useCart";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import useSessionStorage from "grandus-lib/hooks/useSessionStorage";
import { isEmpty, get, toString, pick, isFunction } from "lodash";
import Head from "next/head";
import { DELIVERY_DATA_SESSION_STORAGE_KEY } from "grandus-lib/constants/SessionConstants";

import styles from "./packetery.module.scss";
import yup from "grandus-lib/utils/validator";

const { Text } = Typography;

const WIDGET_URL = "https://widget.packeta.com/www/js/library.js";

export const validationScheme = yup.object().shape({
  specificDeliveryType: yup
    .string()
    .nullable()
    .trim()
    .required("Vyberte odberné miesto"),
});

const Packetery = ({ errors, onSelect }) => {
  const {
    session,
    itemAdd,
    itemRemove,
    isLoading: isSessionStorageLoading,
  } = useSessionStorage();
  const { settings } = useWebInstance();
  const { cart, cartUpdate } = useCart();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = React.useState(
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY)
  );

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
            itemAdd(
              DELIVERY_DATA_SESSION_STORAGE_KEY,
              pick(selected, ["place", "nameStreet", "url"]),
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
                ? "Zmeniť"
                : "Vybrať odberné miesto"}
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
