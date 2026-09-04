import { useTranslation } from "react-i18next";

const Test = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>{t("common.hello")}</p>
    </div>
  );
};

export default Test;
