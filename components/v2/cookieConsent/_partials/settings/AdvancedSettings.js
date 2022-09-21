import useCookieConsent from "grandus-lib/hooks/v2/useCookieConsent";

import Button from "../button/Button";
import Toggle from "../toggle/Toggle";

import styles from "../../CookieConsent.module.scss";
import {
  ANALYTICS_COOKIES,
  COOKIES_ACCEPTED,
  MARKETING_COOKIES,
  PROFILING_COOKIES,
  RETARGETING_COOKIES,
  TECHNICAL_COOKIES,
} from "grandus-lib/constants/CookieConstants";
import { useEffect, useState } from "react";

const AdvancedSettings = ({ handleClose }) => {
  const { cookieConsent, rejectAll, acceptAll, acceptSelected } =
    useCookieConsent();

  const [touched, setTouched] = useState(false);
  const [selected, setSelected] = useState({
    [ANALYTICS_COOKIES]: false,
    [MARKETING_COOKIES]: false,
    [PROFILING_COOKIES]: false,
    [RETARGETING_COOKIES]: false,
  });

  useEffect(() => {
    if (cookieConsent) {
      setSelected({
        [ANALYTICS_COOKIES]:
          cookieConsent[ANALYTICS_COOKIES] === COOKIES_ACCEPTED,
        [MARKETING_COOKIES]:
          cookieConsent[MARKETING_COOKIES] === COOKIES_ACCEPTED,
        [PROFILING_COOKIES]:
          cookieConsent[PROFILING_COOKIES] === COOKIES_ACCEPTED,
        [RETARGETING_COOKIES]:
          cookieConsent[RETARGETING_COOKIES] === COOKIES_ACCEPTED,
      });
    }
  }, [cookieConsent]);

  const handleConsentChange = (e) => {
    const { name, checked } = e?.target;
    setSelected((state) => {
      return { ...state, [name]: checked };
    });
    if (!touched) {
      setTouched(true);
    }
  };

  const handleRejectAll = () => {
    rejectAll();
    if (handleClose instanceof Function) {
      handleClose();
    }
  };

  const handleAcceptAll = () => {
    acceptAll();
    if (handleClose instanceof Function) {
      handleClose();
    }
  };

  const handleAcceptSelected = (selected) => () => {
    acceptSelected(selected);
    if (handleClose instanceof Function) {
      handleClose();
    }
  };

  const data = {
    title: "Nastavenie cookies pre optimálne fungovanie e-shopu",
    content:
      "Náš e-shop používa súbory cookies, ktoré potrebuje, aby správne fungoval, dobre sa ovládal a aby sa Vám zobrazovali najmä relevantné ponuky.",
    options: [
      {
        key: "cookie-consent-technical",
        title: `Technické cookies`,
        name: TECHNICAL_COOKIES,
        disabled: true,
        checked: true,
        content:
          "Technické súbory cookies sú nevyhnutné pre správne fungovanie webovej stránky a musia byť aktívne.",
      },
      {
        key: "cookie-consent-analytical",
        title: `Analytické cookies`,
        name: ANALYTICS_COOKIES,
        disabled: false,
        checked: selected[ANALYTICS_COOKIES],
        content:
          "Analytické cookies slúžia pre anonymný zber cenných dát zákazníckeho správania, ktoré nám umožňujú eshop neustále vylepšovať a zpríjemňovať Vám zážitok z nákupu.",
      },
      {
        key: "cookie-consent-marketing",
        title: `Marketingové cookies`,
        name: MARKETING_COOKIES,
        disabled: false,
        checked: selected[MARKETING_COOKIES],
        content:
          "Vďaka marketingovým cookies bude pre Vás používanie nášho webu pohodlnejšie a prispôsobené Vašim preferenciám. Rovnako uvidíte viac ponuky, ktoré Vás môžu zaujímať a menej nerelevantnej reklamy.",
      },
    ],
  };

  return (
    <>
      <div className={styles?.head}>
        <div>
          <h2 className={styles.headline}>{data.title}</h2>
          <p className={styles.content}>{data.content}</p>
        </div>
        <Button onClick={handleAcceptAll} className={styles?.acceptAllButton}>
          Prijať všetky
        </Button>
      </div>
      <div className={styles?.consents}>
        {data?.options.map((cookieSection) => (
          <div key={cookieSection?.key} className={styles?.consentSection}>
            <Toggle
              label={cookieSection?.title}
              name={cookieSection?.name}
              handleChange={handleConsentChange}
              disabled={cookieSection?.disabled}
              checked={cookieSection?.checked}
            />

            <p>{cookieSection?.content}</p>
          </div>
        ))}
      </div>

      <Button type="ghost" onClick={handleRejectAll}>
        Odmietnuť všetky
      </Button>
      <Button
        onClick={touched ? handleAcceptSelected(selected) : handleAcceptAll}
      >
        {touched ? "Potvrdiť vybrané" : "Prijať všetky"}
      </Button>
      {cookieConsent?.link ? (
        <a href={cookieConsent?.link}>Zistiť viac informácií.</a>
      ) : (
        ""
      )}
    </>
  );
};

export default AdvancedSettings;
