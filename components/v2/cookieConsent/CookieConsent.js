import { useEffect, useState } from "react";

import useCookieConsent from "grandus-lib/hooks/v2/useCookieConsent";

import TagManager from "grandus-lib/utils/gtag";

import BaseSettings from "./_partials/settings/BaseSettings";
import AdvancedSettings from "./_partials/settings/AdvancedSettings";

import styles from "./CookieConsent.module.scss";
import { isEmpty } from "lodash";
import FBPixel from "grandus-lib/utils/fbpixel";

const CookieConsent = ({}) => {
  const { cookieConsent, isLoading } = useCookieConsent();
  const [advancedSetting, setAdvancedSettings] = useState(false);

  useEffect(() => {
    TagManager.consentUpdate(cookieConsent);
    FBPixel.consentUpdate(cookieConsent);
  }, [cookieConsent]);

  return (
    <>
      {!Boolean(cookieConsent?.accepted) &&
      !(isEmpty(cookieConsent) && isLoading) ? (
        <div className={styles.consent}>
          <div className={styles.wrapper}>
            {advancedSetting ? (
              <AdvancedSettings
                handleClose={() => setAdvancedSettings(false)}
              />
            ) : (
              <BaseSettings
                handleOpenAdvancedSettings={() => setAdvancedSettings(true)}
                handleClose={() => setAdvancedSettings(false)}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CookieConsent;
