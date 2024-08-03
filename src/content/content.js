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
  console.log(contentConfig, "config 11111");
  setI18nConfig({
    lng: contentConfig.language,
  });
  if (contentConfig.isOpen) {
    biliInit();
  } else {
    liveControl?.destroy();
  }
}
function biliInit() {
  liveControl?.destroy();
  liveControl = new BiliBiliSearch();
}
indexDb.init().then(() => {
  console.log("开启IndexDb监听");
});

function activeBiliWatch() {
  const messageList = [];
  liveData.bilibili = messageList;
  const href = location.href.split("/")?.at(-1).split("?");
  const liveId = href[0];
  const liveName = document.querySelector(".room-owner-username")?.title;
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const item = mutation.previousSibling;
        const { uname, danmaku, uid, timestamp } = item.dataset;
        uid &&
          indexDb.push({
            user: uname,
            text: danmaku,
            uid,
            timestamp,
            siteType: "1",
            liveId,
            liveName,
          });
      }
    }
    console.log(messageList);
  });
  // observer.observe(biliChats, { attributes: false, childList: true, subtree: false});
}
