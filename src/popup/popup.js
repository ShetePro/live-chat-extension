import { createDocumentEl, setConfig } from "../utils/util";
import { ExtensionConfig } from "../background/config";
import { i18Text, setI18nConfig } from "../locales/i8n";
import { popupConfig } from "../main";
import { createSwitch } from "../components/switch/swtich";
export function createTitle() {
  return createDocumentEl("div", {
    classList: ["title"],
    append: [i18Text("setting")],
  });
}
export function createDefaultOpenSetting() {
  const switchBox = createSwitch(popupConfig.isOpen, {
    change: (e) => {
      popupConfig.isOpen = e.target.checked;
      setConfig(popupConfig);
    },
  });
  return renderSettingItem(i18Text("isOpen"), switchBox);
}
export function createColorSetting() {
  const color = createDocumentEl("input");
  color.type = "color";
  color.value = ExtensionConfig.selectColor;
  color.addEventListener("change", (e) => {
    popupConfig.selectColor = e.target.value;
    setConfig(popupConfig);
  });
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
    option.selected = item.value === popupConfig.language;
    select.append(option);
  });
  select.addEventListener("change", (e) => {
    popupConfig.language = e.target.value;
    setConfig(popupConfig).then(() => {
      setI18nConfig({
        lng: e.target.value,
      });
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
