import Script from 'next/script';
import styles from './SpsProvider.module.scss';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import useSessionStorage from 'grandus-lib/hooks/useSessionStorage';
import useWebInstance from 'grandus-lib/hooks/useWebInstance';
import useCart from 'grandus-lib/hooks/useCart';
import { useEffect, useRef, useState } from 'react';
import { DELIVERY_DATA_SESSION_STORAGE_KEY } from 'grandus-lib/constants/SessionConstants';
import assign from 'lodash/assign';
import toString from 'lodash/toString';
import pick from 'lodash/pick';
import isFunction from 'lodash/isFunction';
import { SPS_TYPE } from '../index';
import { updateDeliverySelection } from '../updateDeliverySelection';

const WIDGET_URL = 'https://balikomat.sps-sro.sk/widget/v1/initialize.js';

const SpsProvider = ({ errors, delivery, onSelect, config = {} }) => {
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
    get(session, DELIVERY_DATA_SESSION_STORAGE_KEY),
  );

  useEffect(() => {
    setSelectedPickupPoint(get(session, DELIVERY_DATA_SESSION_STORAGE_KEY));
  }, [session?.deliveryProviderData?.nameStreet]);

  const handlePickupPointSelection = async selected => {
    let pickupPointId = get(selected, 'id') || null;

    if (pickupPointId !== cart?.specificDeliveryType) {
      setIsLoading(true);

      const newCart = await updateDeliverySelection({
        cartUpdate,
        cart,
        delivery,
        specificDeliveryType: toString(pickupPointId),
      });

      if (newCart?.specificDeliveryType) {
        itemAdd(
          DELIVERY_DATA_SESSION_STORAGE_KEY,
          pick(selected, [
            'address',
            'city',
            'countryISO',
            'description',
            'id',
            'type',
            'zip',
          ]),
          sessionData =>
            setSelectedPickupPoint(
              get(sessionData, DELIVERY_DATA_SESSION_STORAGE_KEY, null),
            ),
        );
      } else {
        itemRemove(DELIVERY_DATA_SESSION_STORAGE_KEY);
        setSelectedPickupPoint(null);
      }

      if (isFunction(onSelect)) {
        onSelect(pickupPointId);
      }
      setIsLoading(false);
    }
  };

  // the widget calls a global, so the handler must be re-registered on every
  // render - a handler captured once would keep reading the first render's
  // cart (still null) and delivery, and would never re-send the payment
  const handlePickupPointSelectionRef = useRef(handlePickupPointSelection);
  handlePickupPointSelectionRef.current = handlePickupPointSelection;

  useEffect(() => {
    window.FillBoxMachine3 = pp => handlePickupPointSelectionRef.current(pp);
  }, []);

  let spsOptions = {
    country: 'SK',
  };

  spsOptions = assign(spsOptions, config);

  const showModal = () => {
    window?.initializeWidget(spsOptions);
  };

  const isSpsSelected =
    cart?.delivery?.serviceProviderType === SPS_TYPE &&
    cart?.specificDeliveryType &&
    !isEmpty(selectedPickupPoint);

  return (
    <>
      <Script src={WIDGET_URL} defer={true}></Script>

      <div className={`${styles.sps} sps__custom`}>
        {isLoading || isSessionStorageLoading ? (
          'loading'
        ) : (
          // <LoadingOutlined spin />
          <div className={`${styles.selected} sps__custom--selected`}>
            {isSpsSelected ? (
              <p>
                <strong>{get(selectedPickupPoint, 'address', '')}</strong>
                <br />
                {get(selectedPickupPoint, 'city', '')}
              </p>
            ) : null}
            <button
              type={!isEmpty(errors?.specificDeliveryType) ? 'danger' : null}
              onClick={showModal}
            >
              {isSpsSelected
                ? get(config, 'text.changePlaceLabel', 'Zmeniť')
                : get(config, 'text.choosePlaceLabel', 'Vybrať odberné miesto')}
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

export default SpsProvider;
