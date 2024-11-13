import "../index.css";
import { setI18nConfig } from "../../locales/i8n";
import { LiveSearch } from "../LiveSearch";
import { SiteType } from "../../enum";
import { getChromeStorage } from "@/background/util";
import { ExtensionConfig } from "@/background/config";
import { watchConfig } from "@/utils/configWatcher";

let contentConfig: SettingConfig | null = null;
let liveControl: any = null;

setTimeout(() => {
  getChromeStorage(ExtensionConfig.key).then((result) => {
    contentConfig = result;
    init();
  });
}, 2000);
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
  liveControl = new HuyaSearch(contentConfig);
}
export class HuyaSearch extends LiveSearch {
  constructor(config: any) {
    super(config);
    // 设置chat list 选择器
    this.listSelector = "#chat-room__list";
    this.siteType = SiteType.huya;
    this.liveId = this.href[0];
    this.liveName = (
      document.querySelector(".host-name") as HTMLElement
    )?.title;
    this.chatListDom = document.querySelector(this.listSelector);
    this.init();
  }

  getNameSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".name") as HTMLElement;
  }
  // 获取内容span
  getChatSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".msg") as HTMLElement;
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
