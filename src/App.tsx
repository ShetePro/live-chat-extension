import {i18Text, setI18nConfig} from "@/locales/i8n";
import { ExtensionConfig } from "@/background/config";
import SettingForm from "@/popup/SettingForm";

setI18nConfig({
  lng: ExtensionConfig.language,
});
function App() {
  console.log('render app')
  return (
    <>
      <div id={"app"}>
        <header className={'title'}>{i18Text('setting')}</header>
        <SettingForm></SettingForm>
      </div>
    </>
  );
}

export default App
