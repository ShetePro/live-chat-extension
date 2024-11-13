import "../index.css";
import { setI18nConfig } from "@/locales/i8n";
import { LiveSearch } from "../LiveSearch";
import { SearchType, SiteType } from "@/enum";
import { getChromeStorage } from "@/background/util";
import { ExtensionConfig } from "@/background/config";
import { watchConfig } from "@/utils/configWatcher";
import {getQuerySelectorConfig, getUrlQuery} from "@/utils/util";

let contentConfig: SettingConfig | null = null;
let liveControl: YoutubeSearch = null;
const querySelectorConfig = getQuerySelectorConfig()["youtube"];
setTimeout(() => {
  getChromeStorage(ExtensionConfig.key).then((result) => {
    console.log("config", result);
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
  liveControl = new YoutubeSearch(contentConfig);
}

class YoutubeSearch extends LiveSearch {
  constructor(config: SettingConfig) {
    super(config);
    this.listSelector = querySelectorConfig.listSelector;
    this.chatListDom = document.querySelector(this.listSelector);
    this.siteType = SiteType.youtube;
    this.liveId = getUrlQuery('v');
    this.liveName = (
      document.querySelector("#text") as HTMLElement
    )?.title;
    this.liveAvatar = (document.querySelector('#avatar img') as HTMLImageElement)?.src
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
    const user = this.getNameSpanByMsg(msg)?.innerText;
    const text = this.getChatSpanByMsg(msg)?.innerText;
    if (
      (this.searchType === SearchType.user ? user : text)?.indexOf(
        this.searchText,
      ) >= 0
    ) {
      this.searchList.push(msg);
      return true;
    }
    return false;
  }
  getNameSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(
      querySelectorConfig.userNameSelector,
    ) as HTMLElement;
  }
  // 获取内容span
  getChatSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(
      querySelectorConfig.messageSelector,
    ) as HTMLElement;
  }
  getUserAvatarByMsg (msg: HTMLElement) {
    const img = msg.querySelector("#img") as HTMLImageElement;
    return img?.src || ''
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
      const scroll = this.chatListDom.parentElement.parentElement as HTMLElement;
      const top = textDom.offsetTop - 100;
      scroll.scrollTo({
        top,
        behavior: "auto",
      })
      resolve();
    });
  }
}
