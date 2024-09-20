import { i18Text, setI18nConfig } from "@/locales/i8n";
import { ExtensionConfig } from "@/background/config";
import SettingForm from "@/popup/SettingForm";
import { useEffect, useState } from "react";
import { getChromeStorage } from "@/background/util";
import EmptyForm from "@/popup/empty";

setI18nConfig({
  lng: ExtensionConfig.language,
});
function App() {
  console.log("render app");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(ExtensionConfig);
  useEffect(() => {
    getChromeStorage(ExtensionConfig.key).then((result) => {
      console.log("storage config", result);
      setConfig(result)
      setLoading(false);
    });
  }, []);
  return (
    <>
      <div id={"app"}>
        <header className={"title"}>{i18Text("setting")}</header>
        {loading ? (
          <EmptyForm />
        ) : (
          <SettingForm config={config}></SettingForm>
        )}
      </div>
    </>
  );
}

export default App;
