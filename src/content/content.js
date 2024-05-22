import { BasicIndexDb } from "/src/modules/indexDb.js";
import { createOpenPoint } from "./popupBox.js";

const biliChats = document.querySelector("#chat-items");
biliChats.classList.add("lce-watch-chat-list");
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
indexDb.init().then(() => {
  console.log("开启监听");
  if (biliChats) {
    activeBiliWatch();
    indexDb.getPageBySiteType({ pageSize: 10, pageIndex: 2, liveId: "5194110", siteType: '1' }).then((res) => {
      console.log(res, "list");
    });
  }
});

function activeBiliWatch() {
  const messageList = [];
  liveData.bilibili = messageList;
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
            liveId: "5194110",
          });
      }
    }
    console.log(messageList);
  });
  observer.observe(biliChats, watchConfig);
}

createOpenPoint();
