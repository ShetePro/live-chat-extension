import "./popup.css";
import {createDocumentEl, getConfig} from "./src/utils/util";
import i18next from "i18next";
import { setI18nConfig } from "./src/locales/i8n";
import {createColorSetting, createLanguagesSetting, createTitle} from "./src/popup/popup";
export let config = {}
getConfig().then(({value}) => {
  config = value
  setI18nConfig({
    lng: config.language
  });
  renderSetting()
})
i18next.on("languageChanged", function (lng) {
  console.log("language change", lng);
  renderSetting();
});
function renderSetting() {
  const main = document.querySelector("#app");
  const oldList = main.querySelector(".setting-list");
  if (oldList) {
    main.removeChild(oldList);
  }
  const list = createDocumentEl("div", {
    classList: ["setting-list"],
    append: [createTitle(), createColorSetting(), createLanguagesSetting()],
  });
  main.append(list);
}


function changeLanguage(e) {
  console.log(e);
}
