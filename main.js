import "./popup.css";
import { createDocumentEl } from "./src/utils/util";
import i18next from "i18next";
import { setI18nConfig } from "./src/locales/i8n";
import {ExtensionConfig} from "./src/config";
setI18nConfig();
renderSetting();
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
    append: [createColorSetting(), createLanguagesSetting()],
  });
  main.append(list);
}

function createColorSetting() {
  console.log(i18next);
  const color = createDocumentEl("input");
  color.type = "color";
  color.value = ExtensionConfig.selectColor
  return renderSettingItem(i18next.t("selectTextColor"), color);
}
function createLanguagesSetting() {
  const select = createDocumentEl("select");
  const options = [
    { name: "English", value: "en" },
    { name: "简体中文", value: "cn" },
  ];
  options.forEach((item) => {
    const option = createDocumentEl("option", { append: [item.name] });
    option.value = item.value;
    option.name = item.name;
    option.selected = item.value === ExtensionConfig.language
    select.append(option);
  });
  select.addEventListener("change", (e) => {
    console.log("change language", e.target.value);
    ExtensionConfig.language = e.target.value
    setI18nConfig({
      lng: e.target.value,
    });
  });
  return renderSettingItem(i18next.t("languages"), select);
}
function renderSettingItem(label, select) {
  const span = createDocumentEl("span", { append: [label] });
  return createDocumentEl("div", {
    classList: ["setting-item"],
    append: [span, select],
  });
}
function changeLanguage(e) {
  console.log(e);
}
