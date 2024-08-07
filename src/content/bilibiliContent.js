import './index.css'
import { BasicIndexDb } from "/src/modules/indexDb";
import { BiliBiliSearch } from "./bilibili";
import { setI18nConfig } from "../locales/i8n";
import { getConfig } from "../utils/util";
import { watchConfig } from "../utils/configWatcher";

export let contentConfig = {};
let liveControl = null;
const indexDb = new BasicIndexDb();
getConfig().then(({ value }) => {
  contentConfig = value;
  init();
});
watchConfig((request) => {
  console.log(request);
  contentConfig = request;
  init();
});

function init() {
  setI18nConfig({
    lng: contentConfig.language,
  });
  if (contentConfig.isOpen) {
    searchInit();
  } else {
    liveControl?.destroy();
  }
}
function searchInit() {
  liveControl?.destroy();
  console.log(location.href)
  liveControl = new BiliBiliSearch();
}
