import { BasicIndexDb } from "/src/modules/indexDb.js";
import {createSearchBox} from "./searchBox.js";

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
    // activeBiliWatch();
  }
  createSearchBox();
});

function activeBiliWatch() {
  const messageList = [];
  liveData.bilibili = messageList;
  const href = location.href.split('/')?.at(-1).split('?')
  const liveId = href[0]
  const liveName = document.querySelector('.room-owner-username')?.title
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
            liveName
          });
      }
    }
    console.log(messageList);
  });
  observer.observe(biliChats, watchConfig);
}

