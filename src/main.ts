// import "../popup.css";
// import { createDocumentEl, getConfig } from "./utils/util";
// import i18next from "i18next";
// import { setI18nConfig } from "./locales/i8n";
import App from './popup/App.vue'
import {createApp} from "vue";
// import {
//   createColorSetting, createDefaultOpenSetting,
//   createLanguagesSetting,
//   createTitle,
// } from "./popup/popup.js";
// export let popupConfig: SettingConfig | null = null;
// getConfig().then(({ value }) => {
//   popupConfig = value;
//   setI18nConfig({
//     lng: popupConfig.language,
//   });
//   renderSetting();
// });
// i18next.on("languageChanged", function () {
//   renderSetting();
// });
// function renderSetting() {
//   const main = document.querySelector("#app");
//   const oldList = main?.querySelector(".setting-list");
//   if (oldList) {
//     main?.removeChild(oldList);
//   }
//   const list = createDocumentEl("div", {
//     classList: ["setting-list"],
//     append: [
//       createTitle(),
//       createDefaultOpenSetting(),
//       createColorSetting(),
//       createLanguagesSetting(),
//     ],
//   });
//   main.append(list);
// }

const app = createApp(App)
// this element doesn't exist
app.mount('#app')
