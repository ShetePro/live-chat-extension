import { SearchType } from "./searchBox.js";
import { getConfig } from "../utils/util";
import "./index.css";
import { watchConfig } from "../utils/configWatcher";
import { setI18nConfig } from "../locales/i8n";
import { LiveSearch } from "./LiveSearch";
import { SiteType } from "../utils/enum";

let contentConfig = {};
let liveControl = null;
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
  console.log(location.href);
  liveControl = new BiliBiliSearch(contentConfig);
}

class BiliBiliSearch extends LiveSearch {
  constructor(config) {
    super(config);
    this.listSelector = "#chat-items";
    this.chatListDom = document.querySelector(this.listSelector);
    this.siteType = SiteType.bilibili;
    this.liveId = this.href[0];
    this.init();
  }
  search({ text, index = 0, type }) {
    return new Promise(async (resolve, reject) => {
      const list = this.chatListDom.children;
      this.searchType = type;
      try {
        await this.clearHighLight();
        if (text !== "") {
          this.indexDb.getPageBySiteType({
            pageIndex: 1,
            pageSize: 10,
            siteType: this.siteType,
            liveId: this.liveId,
            text
          }).then((res) => {
            console.log(res)
          });
          this.searchText = text;
          this.searchList = [];
          for (const chat of list) {
            this.pushMsgBySearch(chat);
          }
          // 高亮
          this.highLight().then(() => {
            resolve({ index, total: this.searchList.length });
          });
        } else {
          this.observer?.disconnect();
          this.observer = null;
          this.searchText = "";
          this.searchList = [];
          resolve({ index: 0, total: 0 });
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  pushMsgBySearch(msg) {
    const { danmaku, uname } = msg.dataset;
    if (
      (this.searchType === SearchType.user ? uname : danmaku)?.indexOf(
        this.searchText,
      ) >= 0
    ) {
      this.searchList.push(msg);
      return true;
    }
    return false;
  }
  pushMsgDatabase(msg) {
    const liveName = document.querySelector(".room-owner-username")?.title;
    const name = this.getNameSpanByMsg(msg)?.innerText.slice(0, -1);
    const text = this.getChatSpanByMsg(msg)?.innerText;
    text && this.indexDb?.push({
      user: name,
      text,
      timestamp: new Date().getTime(),
      siteType: this.siteType,
      liveId: this.liveId,
      liveName,
    });
  }
  getNameSpanByMsg(msg) {
    return msg.querySelector(".user-name");
  }
  // 获取内容span
  getChatSpanByMsg(msg) {
    return msg.querySelector(".danmaku-item-right");
  }
  getScrollBar() {
    const list =
      document.body.querySelector("#chat-history-list") ||
      this.iframe.contentDocument?.activeElement?.querySelector(
        "#chat-history-list",
      );
    return list?.querySelector(".ps__scrollbar-y-rail");
  }
  scrollTo(index) {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!textDom) {
        console.log("index 错误");
        reject();
        return;
      }
      const scrollBar = this.getScrollBar();
      this.searchTextTop = textDom.offsetTop;
      const top = this.searchTextTop - parseInt(scrollBar.style.top);
      // 创建WheelEvent对象
      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: top, // 向上滚动
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      });
      this.chatListDom.dispatchEvent(event);
      resolve();
    });
  }
}
