import { getConfig } from "../utils/util";
import "./index.css";
import { watchConfig } from "../utils/configWatcher";
import { setI18nConfig } from "../locales/i8n";
import { LiveSearch } from "./LiveSearch";
import { SearchType, SiteType } from "../enum";

let contentConfig: SettingConfig | null = null;
let liveControl: BiliBiliSearch = null;
setTimeout(() => {
  getConfig().then(({ value }) => {
    contentConfig = value;
    init();
  });
}, 2000);
watchConfig((request: SettingConfig) => {
  console.log(request);
  contentConfig = request;
  init();
});

function init() {
  if (!contentConfig) return;
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
  constructor(config: SettingConfig) {
    super(config);
    this.listSelector = "#chat-items";
    this.chatListDom = document.querySelector(this.listSelector);
    this.siteType = SiteType.bilibili;
    this.liveId = this.href[0];
    this.liveName = (
      document.querySelector(".room-owner-username") as HTMLElement
    )?.title;
    this.init();
  }
  search({
    text,
    index = 0,
    type,
  }: {
    text: string;
    index: number;
    type: SearchType;
  }): Promise<{ index: number; total: number }> {
    return new Promise(async (resolve, reject) => {
      const list = this.chatListDom?.children;
      this.searchType = type;
      try {
        await this.clearHighLight();
        if (text !== "") {
          this.searchText = text;
          this.searchList = [];
          for (const chat of list) {
            this.pushMsgBySearch(chat as HTMLElement);
          }
          // 高亮
          this.highLight().then(() => {
            resolve({ index, total: this.searchList.length });
          });
        } else {
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
  pushMsgBySearch(msg: HTMLElement) {
    const { danmaku, uname } = msg.dataset;
    if (
      (this.searchType === SearchType.user ? uname : danmaku)?.indexOf(
        this.searchText
      ) >= 0
    ) {
      this.searchList.push(msg);
      return true;
    }
    return false;
  }
  getNameSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".user-name") as HTMLElement;
  }
  // 获取内容span
  getChatSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".danmaku-item-right") as HTMLElement;
  }
  getScrollBar(): HTMLElement {
    const selector = "#chat-history-list";
    let list = document.body.querySelector(selector);
    if (!list && this.iframe?.contentDocument) {
      list = this.iframe.contentDocument.activeElement.querySelector(selector);
    }
    return list?.querySelector(".ps__scrollbar-y-rail");
  }
  scrollTo(index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!textDom) {
        console.log("index 错误");
        reject();
        return;
      }
      const scrollBar = this.getScrollBar();
      this.searchTextTop = textDom.offsetTop;
      const top = this.searchTextTop - parseInt(scrollBar?.style.top);
      // 创建WheelEvent对象
      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: top, // 向上滚动
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      });
      this.chatListDom?.dispatchEvent(event);
      resolve();
    });
  }
}
