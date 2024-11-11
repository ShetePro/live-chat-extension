import { setI18nConfig } from "@/locales/i8n";
import { ExtensionConfig } from "@/background/config";
import SettingForm from "@/popup/SettingForm";
import { useEffect, useState } from "react";
import {
  getChromeStorage,
  setChromeStorage,
  watchChromeStorage,
} from "@/background/util";
import EmptyForm from "@/popup/empty";
import i18next from "i18next";
import { setPopupTheme } from "@/utils/theme";

function App() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(ExtensionConfig);
  useEffect(() => {
    getChromeStorage(ExtensionConfig.key).then((result) => {
      if (result) {
        setConfig(result);
      } else {
        setChromeStorage(config.key, config);
      }
      const setting = result || config;
      setI18nConfig({
        lng: setting.language,
      });
      document.querySelector("html").style.fontSize = setting.fontSize;
      setLoading(false);
      setPopupTheme(setting.theme);

      watchChromeStorage((changes) => {
        const { newValue, oldValue } = changes[ExtensionConfig.key];
        if (newValue.language !== oldValue.language) {
          i18next.changeLanguage(newValue.language).then(() => {
            setConfig(newValue);
          });
        }
        if (newValue.fontSize !== oldValue.fontSize) {
          setConfig(newValue);
          document.querySelector("html").style.fontSize = newValue.fontSize;
        }
        if (newValue.theme !== oldValue.theme) {
          setPopupTheme(newValue.theme);
        }
      });
    });
  }, []);
  return (
    <>
      <div id={"app"}>
        {/*<header className={"title"}>{i18Text("setting")}</header>*/}
        {loading ? <EmptyForm /> : <SettingForm config={config}></SettingForm>}
      </div>
    </>
  );
}

export default App;
