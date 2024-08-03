import "./popup.css";
import { createDocumentEl, getConfig } from "./src/utils/util";
import i18next from "i18next";
import { setI18nConfig } from "./src/locales/i8n";
import {
  createColorSetting, createDefaultOpenSetting,
  createLanguagesSetting,
  createTitle,
} from "./src/popup/popup";
import { createSwitch } from "./src/components/switch/swtich";
export let popupConfig = {};
getConfig().then(({ value }) => {
  popupConfig = value;
  setI18nConfig({
    lng: popupConfig.language,
  });
  renderSetting();
});
i18next.on("languageChanged", function (lng) {
  renderSetting();
});
function renderSetting() {
  const main = document.querySelector("#app");
  const oldList = main?.querySelector(".setting-list");
  if (oldList) {
    main?.removeChild(oldList);
  }
  const list = createDocumentEl("div", {
    classList: ["setting-list"],
    append: [
      createTitle(),
      createDefaultOpenSetting(),
      createColorSetting(),
      createLanguagesSetting(),
    ],
  });
  main.append(list);
}

function changeLanguage(e) {
  console.log(e);
}
