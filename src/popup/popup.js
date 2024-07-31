import { createDocumentEl } from "../utils/util";
import { ExtensionConfig } from "../background/config";
import { i18Text, setI18nConfig } from "../locales/i8n";
import {config} from "../../main";
export function createTitle() {
  return createDocumentEl("div", {
    classList: ["title"],
    append: [i18Text("setting")],
  });
}
export function createColorSetting() {
  const color = createDocumentEl("input");
  color.type = "color";
  color.value = ExtensionConfig.selectColor;
  return renderSettingItem(i18Text("selectTextColor"), color);
}
export function createLanguagesSetting() {
  const select = createDocumentEl("select");
  const options = [
    { name: "English", value: "en" },
    { name: "简体中文", value: "cn" },
  ];
  options.forEach((item) => {
    const option = createDocumentEl("option", { append: [item.name] });
    option.value = item.value;
    option.name = item.name;
    option.selected = item.value === config.language;
    select.append(option);
  });
  select.addEventListener("change", (e) => {
    config.language = e.target.value;
    chrome.runtime.sendMessage(
      {
        type: "setData",
        key: "config",
        value: { ...config },
      },
      (response) => {
        console.log(response.status);
      },
    );
    setI18nConfig({
      lng: e.target.value,
    });
  });
  return renderSettingItem(i18Text("languages"), select);
}
function renderSettingItem(label, select) {
  const span = createDocumentEl("span", { append: [label] });
  return createDocumentEl("div", {
    classList: ["setting-item"],
    append: [span, select],
  });
}
