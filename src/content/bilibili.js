import { SearchBox, SearchType } from "./searchBox.js";
import { contentConfig } from "./content";
import { highLightText, observerListPush } from "../utils/util";

export class BiliBiliSearch {
  constructor() {
    this.iframe = null;
    this.liveData = [];
    this.observer = null;
    this.searchBox = null;
    this.searchList = [];
    this.searchText = "";
    this.searchType = SearchType.message;
    this.searchTextTop = 0;
    this.biliChats = document.querySelector("#chat-items");
    // biliBili有些活动会使用iframe 嵌套直播间
    if (!this.biliChats) {
      const iframes = document.body.querySelectorAll("iframe");
      console.log(iframes, "111111111111111");
      for (const iframe of iframes) {
        let list = iframe.contentDocument?.querySelector("#chat-items");
        if (list) {
          this.biliChats = list;
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
        const list = iframe.contentDocument?.querySelector("#chat-items");
        console.log("iframe loaded", list);
        if (list) {
          this.biliChats = list;
          this.iframe = iframe;
          this.renderSearch();
        }
      });
    }
  }
  renderSearch() {
    console.log("renderSearch");
    const { bottom, left, width, top } = this.biliChats.getBoundingClientRect();
    this.searchBox = new SearchBox({
      x: left + width,
      y: bottom + top + 100,
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
      const list = this.biliChats.children;
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
  watchMessage() {
    if (this.observer) return;
    this.observer = observerListPush(this.biliChats, (mutation) => {
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
      document.body.querySelector("#chat-history-list") ||
      this.iframe.contentDocument?.activeElement?.querySelector(
        "#chat-history-list",
      );
    return list?.querySelector(".ps__scrollbar-y-rail");
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
      const top = this.searchTextTop - parseInt(scrollBar.style.top);
      // 创建WheelEvent对象
      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: top, // 向上滚动
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      });
      this.biliChats.dispatchEvent(event);
      resolve();
    });
  }
}
