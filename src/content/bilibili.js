import { SearchBox } from "./searchBox.js";

export class BiliBiliSearch {
  constructor() {
    this.biliChats = document.querySelector("#chat-items");
    // biliBili有些活动会使用iframe 嵌套直播间
    if (!this.biliChats) {
      const iframes = document.body.querySelectorAll("iframe");
      for (const iframe of iframes) {
        this.biliChats =
          this.biliChats ||
          iframe.contentDocument?.activeElement?.querySelector("#chat-items");
      }
    }
    this.liveData = [];
    this.searchBox = null;
    this.searchList = [];
    this.renderSearch();
  }
  renderSearch() {
    this.searchBox = new SearchBox({
      searchCallback: (data) => this.search(data),
    });
    this.searchBox.renderSearch();
  }
  search({ text, index = 0 }) {
    return new Promise((resolve, reject) => {
      console.log(text, "search text", this.biliChats);
      const list = this.biliChats.children;
      this.searchList = [];
      try {
        if (text !== "") {
          for (const chat of list) {
            const { danmaku } = chat.dataset;
            if (danmaku?.indexOf(text) >= 0) {
              this.searchList.push(chat);
            }
          }
          console.log(this.searchList.length);
          resolve({ index, total: this.searchList.length });
        } else {
          resolve({ index: 0, total: 0 });
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
