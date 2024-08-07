import './index.css'
import { SearchBox, SearchType } from "./searchBox.js";
import {getConfig, highLightText, observerListPush} from "../utils/util";
import {watchConfig} from "../utils/configWatcher";
import {setI18nConfig} from "../locales/i8n";

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
  console.log(location.href)
  liveControl = new HuyaSearch();
}
export class HuyaSearch {
  constructor() {
    this.iframe = null;
    this.liveData = [];
    this.observer = null;
    this.searchBox = null;
    this.searchList = [];
    this.searchText = "";
    this.searchType = SearchType.message;
    this.searchTextTop = 0;
    this.chatListDom = document.querySelector("#chat-room__list");
    // biliBili有些活动会使用iframe 嵌套直播间
    if (!this.chatListDom) {
      const iframes = document.body.querySelectorAll("iframe");
      for (const iframe of iframes) {
        let list = iframe.contentDocument?.querySelector("#chat-room__list");
        if (list) {
          this.chatListDom = list;
          this.iframe = iframe;
          this.renderSearch();
        } else {
          this.awaitIframeLoad(iframe);
        }
      }
    } else {
      this.renderSearch();
    }
  }
  awaitIframeLoad(iframe) {
    if (iframe.contentDocument) {
      iframe.addEventListener("load", () => {
        const list = iframe.contentDocument?.querySelector("#chat-room__list");
        if (list) {
          this.chatListDom = list;
          this.iframe = iframe;
          this.renderSearch();
        }
      });
    }
  }
  renderSearch() {
    const { bottom, left, width, top } = this.chatListDom.getBoundingClientRect();
    console.log("renderSearch", this.chatListDom);
    this.searchBox = new SearchBox({
      x: 200,
      y: 100,
      searchCallback: (data) => this.search(data),
      position: (index) => this.scrollTo(index),
    });
    this.searchBox.renderSearch();
  }
  destroy() {
    this.searchBox?.remove();
  }
  search({ text, index = 0, type }) {
    return new Promise(async (resolve, reject) => {
      const list = this.chatListDom.children;
      this.searchType = type;
      try {
        await this.clearHighLight();
        if (text !== "") {
          this.searchText = text;
          this.searchList = [];
          for (const chat of list) {
            this.pushMsgBySearch(chat);
          }
          this.watchMessage();
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
    const name = msg.querySelector('.name')?.innerText
    const text = msg.querySelector('.msg')?.innerText
    if (
      (this.searchType === SearchType.user ? name : text)?.indexOf(
        this.searchText,
      ) >= 0
    ) {
      this.searchList.push(msg);
      return true;
    }
    return false;
  }
  watchMessage() {
    if (this.observer) return;
    this.observer = observerListPush(this.chatListDom, (mutation) => {
      const { target } = mutation;
      const lastMsg = target?.lastChild;
      const add = this.pushMsgBySearch(lastMsg);
      if (add) {
        // 高亮
        this.highLightText(lastMsg);
        this.searchBox.total++;
        this.searchBox.renderTotal();
      }
    });
  }
  getScrollBar() {
    const list =
      document.body.querySelector("#chatRoom") ||
      this.iframe.contentDocument?.querySelector(
        "#chatRoom",
      );
    console.log(list)
    return list?.querySelector(".scroll_move");
  }
  highLight() {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        this.highLightText(item);
      });
      resolve();
    });
  }
  highLightText(item) {
    const span =
      this.searchType === SearchType.user
        ? item.querySelector(".user-name")
        : item.lastChild;
    const html = span.innerHTML;
    const color = contentConfig.selectColor;
    span.innerHTML = highLightText(this.searchText, html, color);
  }
  clearHighLight() {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        const { danmaku, uname } = item.dataset;
        const userName = item.querySelector(".user-name");
        userName.innerHTML = uname + " :";
        const span = item.lastChild;
        span.innerHTML = danmaku;
      });
      resolve();
    });
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
      
      console.log(this.chatListDom.clientHeight)
      const top = isNaN(parseInt(scrollBar.style.top)) ? 0 : parseInt(scrollBar.style.top);
      // 创建WheelEvent对象
      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: -100, // 向上滚动
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      });
      console.log(textDom)
      this.chatListDom.dispatchEvent(event);
      resolve();
    });
  }
}
