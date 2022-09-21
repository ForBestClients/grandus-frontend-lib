import useCookieConsent from "grandus-lib/hooks/v2/useCookieConsent";

import Button from "../button/Button";

import styles from "../../CookieConsent.module.scss";

const BaseSettings = ({ handleOpenAdvancedSettings, handleClose }) => {
  const { cookieConsent, acceptAll } = useCookieConsent();

  const handleAcceptAll = () => {
    acceptAll();
    if (handleClose instanceof Function) {
      handleClose();
    }
  };

  const data = {
    key: "cookie-consent-dialog",
    title: `Súbory "cookie" používame na zlepšenie našich služieb`,
    content:
      "Používame cookies a ďalšie sledovacie technológie, aby sme zlepšili Vaše prehliadanie našich internetových stránok, ukázali vám prispôsobený obsah, analyzovali návštevnosť webových stránok a pochopili, odkiaľ prichádzajú naši návštevníci. Prehliadaním našich webových stránok súhlasíte s naším používaním súborov cookie a ďalších nástrojov na analýzu.",
  };

  return (
    <>
      <p className={styles.headline}>{data.title}</p>
      <p className={styles.content}>{data.content}</p>
      <Button type="ghost" onClick={handleOpenAdvancedSettings}>
        Podrobné nastavenie
      </Button>
      <Button onClick={handleAcceptAll} className={styles?.acceptAllButton}>
        Prijať všetky
      </Button>
      {cookieConsent?.link ? (
        <a href={cookieConsent?.link}>Zistiť viac informácií.</a>
      ) : (
        ""
      )}
    </>
  );
};

export default BaseSettings;
