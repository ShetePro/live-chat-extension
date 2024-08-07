import "./index.css";
import { SearchBox, SearchType } from "./searchBox.js";
import { getConfig, highLightText, observerListPush } from "../utils/util";
import { watchConfig } from "../utils/configWatcher";
import { setI18nConfig } from "../locales/i8n";
import { LiveSearch } from "./LiveSearch";

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
    this.chatListDom = document.querySelector(this.listSelector);
    this.init()
  }
  // 重写render
  renderSearch() {
    console.log("renderSearch", this.chatListDom);
    this.searchBox = new SearchBox({
      x: 200,
      y: 100,
      searchCallback: (data) => this.search(data),
      position: (index) => this.scrollTo(index),
    });
    this.searchBox.renderSearch();
  }
  getNameSpanByMsg(msg) {
    return msg.querySelector('.name')
  }
  // 获取内容span
  getChatSpanByMsg(msg) {
    return msg.querySelector('.msg')
  }
  // 重写查询定位
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
      const top = isNaN(parseInt(scrollBar.style.top))
        ? 0
        : parseInt(scrollBar.style.top);
      // 创建WheelEvent对象
      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: -100, // 向上滚动
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      });
      this.chatListDom.dispatchEvent(event);
      resolve();
    });
  }
}
