import { SearchBox } from "./searchBox.js";

export class BiliBiliSearch {
  constructor() {
    this.iframe = null;
    this.biliChats = document.querySelector("#chat-items");
    // biliBili有些活动会使用iframe 嵌套直播间
    if (!this.biliChats) {
      const iframes = document.body.querySelectorAll("iframe");
      for (const iframe of iframes) {
        const list =
          iframe.contentDocument?.activeElement?.querySelector("#chat-items");
        this.biliChats = this.biliChats || list;
        if (list) {
          this.iframe = iframe;
        }
      }
    }
    this.liveData = [];
    this.searchBox = null;
    this.searchList = [];
    this.searchText = "";
    this.searchTextTop = 0;
    this.renderSearch();
  }
  renderSearch() {
    this.searchBox = new SearchBox({
      searchCallback: (data) => this.search(data),
      position: (index) => this.scrollTo(index),
    });
    this.searchBox.renderSearch();
  }
  search({ text, index = 0 }) {
    return new Promise((resolve, reject) => {
      console.log(text, "search text", this.biliChats);
      const list = this.biliChats.children;
      try {
        if (text !== "") {
          this.searchText = text;
          this.searchList = [];
          for (const chat of list) {
            const { danmaku } = chat.dataset;
            if (danmaku?.indexOf(text) >= 0) {
              this.searchList.push(chat);
            }
          }
          this.highLight().then(() => {
            resolve({ index, total: this.searchList.length });
          });
        } else {
          this.clearHighLight().then(() => {
            this.searchText = "";
            this.searchList = [];
          });
          resolve({ index: 0, total: 0 });
        }
      } catch (e) {
        reject(e);
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
        const span = item.lastChild;
        const html = span.innerHTML;
        const regex = new RegExp(this.searchText, "g");
        span.innerHTML = html.replace(
          regex,
          `<span style="background: #FAD7A0">${this.searchText}</span>`,
        );
      });
      resolve();
    });
  }
  clearHighLight() {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        const span = item.lastChild;
        span.innerHTML = item.dataset.danmaku;
        console.log(item)
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
      console.log(document.querySelector(".ps__scrollbar-y"));
      console.log(scrollBar, "scrollBar");
      this.searchTextTop = textDom.offsetTop;
      const top = this.searchTextTop - parseInt(scrollBar.style.top);
      console.log(top, this.searchTextTop, scrollBar.style.top);
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
