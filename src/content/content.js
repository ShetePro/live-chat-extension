import { BasicIndexDb } from "/src/modules/indexDb.js";
import { BiliBiliSearch } from "./bilibili.js";

const liveData = {
  bilibili: "",
  douyu: "",
  huya: "",
  twitch: "",
};
const indexDb = new BasicIndexDb();
const lceSetting = {
  current: "",
};
const watchConfig = { attributes: false, childList: true, subtree: false };
function biliInit() {
  const biliChats = document.body.querySelector("#chat-items");
  console.log("bili chat", biliChats);
  const control = new BiliBiliSearch();
}
indexDb.init().then(() => {
  console.log("开启IndexDb监听");
  setTimeout(() => {
    biliInit();
  }, 2000);
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
  // observer.observe(biliChats, watchConfig);
}
