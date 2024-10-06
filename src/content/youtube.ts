import "./index.css";
import { setI18nConfig } from "../locales/i8n";
import { LiveSearch } from "./LiveSearch";
import { SearchType, SiteType } from "../enum";
import { getChromeStorage } from "@/background/util";
import { ExtensionConfig } from "@/background/config";
import { watchConfig } from "@/utils/configWatcher";
import { getQuerySelectorConfig } from "@/utils/util";

console.log('这是youtube 直播插件开启')
let contentConfig: SettingConfig | null = null;
let liveControl: YoutubeSearch = null;
const querySelectorConfig = getQuerySelectorConfig()["youtube"];
setTimeout(() => {
  getChromeStorage(ExtensionConfig.key).then((result) => {
    console.log('config', result);
    contentConfig = result;
    init();
  });
}, 4000);
watchConfig(() => liveControl, init).then((res) => {
  contentConfig = res;
});
function init(config: SettingConfig = contentConfig) {
  if (!config) return;
  setI18nConfig({
    lng: config.language,
  });
  if (config.isOpen) {
    searchInit();
  } else {
    liveControl?.destroy();
  }
}
function searchInit() {
  liveControl?.destroy();
  console.log(location.href);
  liveControl = new YoutubeSearch(contentConfig);
}

class YoutubeSearch extends LiveSearch {
  constructor(config: SettingConfig) {
    super(config);
    this.listSelector = querySelectorConfig.listSelector;
    this.chatListDom = document.querySelector(this.listSelector);
    console.log(document.querySelectorAll('.yt-live-chat-item-list-renderer'))
    this.siteType = SiteType.youtube;
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
        this.searchText,
      ) >= 0
    ) {
      this.searchList.push(msg);
      return true;
    }
    return false;
  }
  getNameSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(querySelectorConfig.userNameSelector) as HTMLElement;
  }
  // 获取内容span
  getChatSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(querySelectorConfig.messageSelector) as HTMLElement;
  }
  // 重写查询定位
  scrollTo(index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!this.chatListDom) return;
      if (!textDom) {
        console.log("index 错误", index);
        reject();
        return;
      }
      this.searchTextTop = textDom.offsetTop;
      const offset = Math.max(0, textDom.offsetTop - 300);
      const chatListDom = this.chatListDom as HTMLElement;
      const top =
        chatListDom?.style.top === "auto"
          ? chatListDom.offsetHeight
          : Math.abs(parseInt(chatListDom?.style.top));
      this.scrollView(textDom, {
        offset,
        direction: offset <= Math.abs(top) ? -1 : 1,
      });
      resolve();
    });
  }
  scrollView(textDom: HTMLElement, { offset, direction = -1 }: any) {
    const chatListDom = this.chatListDom as HTMLElement;
    const top =
      chatListDom?.style.top === "auto"
        ? 0
        : Math.abs(parseInt(chatListDom?.style.top));
    if (direction === -1 && chatListDom?.style.top === "0px") {
      return;
    }
    if (direction === 1 && chatListDom?.style.top === "auto") {
      return;
    }
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: 0,
      deltaY: 120 * direction, // 向上滚动
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    });
    this.chatListDom?.dispatchEvent(event);
    if (top === 0 || (direction === -1 ? offset <= top : offset >= top)) {
      this.scrollView(textDom, { offset, direction });
    }
  }
}
