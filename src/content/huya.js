import "./index.css";
import { SearchBox, SearchType } from "./searchBox.js";
import { getConfig, highLightText, observerListPush } from "../utils/util";
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
  liveControl = new HuyaSearch(contentConfig);
}
export class HuyaSearch extends LiveSearch {
  constructor(config) {
    super(config);
    // 设置chat list 选择器
    this.listSelector = "#chat-room__list";
    this.siteType = SiteType.huya;
    this.liveId = this.href[0];
    this.chatListDom = document.querySelector(this.listSelector);
    this.init();
  }

  getNameSpanByMsg(msg) {
    return msg?.querySelector(".name");
  }
  // 获取内容span
  getChatSpanByMsg(msg) {
    return msg?.querySelector(".msg");
  }
  // 重写查询定位
  scrollTo(index) {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!textDom) {
        console.log("index 错误", index);
        reject();
        return;
      }
      const scrollBar = this.getScrollBar();
      this.searchTextTop = textDom.offsetTop;
      const offset = Math.max(0, textDom.offsetTop - 300);
      const top =
        this.chatListDom.style.top === "auto"
          ? this.chatListDom.offsetHeight
          : parseInt(this.chatListDom.style.top);
      this.scrollView(textDom, offset <= Math.abs(top) ? -1 : 1);
      // // 创建WheelEvent对象
      // const event = new WheelEvent("wheel", {
      //   bubbles: true,
      //   cancelable: true,
      //   deltaX: 0,
      //   deltaY: -2, // 向上滚动
      //   deltaMode: WheelEvent.DOM_DELTA_PAGE,
      // });
      // this.chatListDom.dispatchEvent(event);
      resolve();
    });
  }
  scrollView(textDom, direction = -1) {
    const offset = Math.max(0, textDom.offsetTop - 300);
    const top =
      this.chatListDom.style.top === "auto"
        ? 0
        : Math.abs(parseInt(this.chatListDom.style.top));
    if (direction === -1 && this.chatListDom.style.top === "0px") {
      return;
    }
    if (direction === 1 && this.chatListDom.style.top === "auto") {
      return;
    }
    console.log(offset);
    console.log(top);
    console.log(direction)
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaX: 0,
      deltaY: 120 * direction, // 向上滚动
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    });
    this.chatListDom.dispatchEvent(event);
    console.log((direction === -1 ? offset <= top : offset >= top))
    if (top === 0 || (direction === -1 ? offset <= top : offset >= top)) {
      this.scrollView(textDom, direction);
    }
  }
}
