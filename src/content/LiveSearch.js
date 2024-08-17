import { SearchBox, SearchType } from "./searchBox";
import {
  createDocumentEl,
  highLightText,
  observerListPush,
} from "../utils/util";
import { BasicIndexDb } from "../modules/indexDb";

export class LiveSearch {
  constructor(config) {
    this.contentConfig = config;
    this.iframe = null;
    this.liveData = [];
    this.observer = null;
    this.searchBox = null;
    this.searchList = [];
    this.searchText = "";
    this.searchType = SearchType.message;
    this.searchTextTop = 0;
    this.chatListDom = null;
    this.listSelector = "";
    this.indexDb = new BasicIndexDb();
    this.liveId = "";
    this.siteType = "";
    this.href = location.href.split("/")?.at(-1).split("?");
    // window.addEventListener("beforeunload", (event) => {
    //   // 清空该直播间 IndexedDB 记录的聊天数据
    //   this.indexDb?.clearBySearch({
    //     siteType: this.siteType,
    //     liveId: this.liveId,
    //   });
    // });
  }
  init() {
    // biliBili有些活动会使用iframe 嵌套直播间
    if (!this.chatListDom) {
      const iframes = document.body.querySelectorAll("iframe");
      for (const iframe of iframes) {
        let list = iframe.contentDocument?.querySelector(this.listSelector);
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
        const list = iframe.contentDocument?.querySelector(this.listSelector);
        if (list) {
          this.chatListDom = list;
          this.iframe = iframe;
          this.renderSearch();
        }
      });
    }
  }
  renderSearch() {
    const { bottom, left, width, top } =
      this.chatListDom.getBoundingClientRect();
    this.searchBox = new SearchBox({
      indexDb: this.indexDb,
      x: left + width,
      y: bottom + 100,
      liveId: this.liveId,
      siteType: this.siteType,
      searchCallback: (data) => this.search(data),
      position: (index) => this.scrollTo(index),
    });
    this.searchBox.renderSearch();
    this.indexDb.init().then(() => {
      // watch chat list push msg
      console.log("开启IndexDb监听");
      this.watchMessage();
    });
  }
  destroy() {
    this.searchBox?.remove();
    this.observer?.disconnect();
    this.indexDb = null;
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
  pushMsgBySearch(msg) {
    const name = this.getNameSpanByMsg(msg)?.innerText;
    const text = this.getChatSpanByMsg(msg)?.innerText;
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
      const { addedNodes } = mutation;
      const lastMsg = addedNodes[0];
      if (this.searchText) {
        const add = this.pushMsgBySearch(lastMsg);
        if (add) {
          // 高亮
          this.highLightMsg(lastMsg);
          this.searchBox.total++;
          this.searchBox.renderTotal();
        }
      }
      // 默认将聊天内容记录在indexDb
      this.pushMsgDatabase(lastMsg);
    });
  }
  pushMsgDatabase(msg) {
    let anchor = this.getNameSpanByMsg(msg)?.innerText,
      text,
      time = new Date().getTime(),
      liveId = "",
      liveName = "";
    text = this.getChatSpanByMsg(msg).textContent;
    text &&
      this.indexDb?.push({
        user: anchor,
        text,
        timestamp: time,
        siteType: this.siteType,
        liveId,
        liveName,
      });
  }
  getScrollBar() {
    const list =
      document.body.querySelector("#chatRoom") ||
      this.iframe.contentDocument?.querySelector("#chatRoom");
    console.log(list);
    return list?.querySelector(".scroll_move");
  }
  highLight() {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        this.highLightMsg(item);
      });
      resolve();
    });
  }
  // 自定义高亮
  highLightMsg(item) {
    const span =
      this.searchType === SearchType.user
        ? this.getNameSpanByMsg(item)
        : this.getChatSpanByMsg(item);
    for (const node of span.childNodes) {
      // 只检索textNode 忽略表情元素
      if (node.nodeType === 3) {
        const highLightSpan = createDocumentEl("span");
        const text = node.textContent;
        const color = this.contentConfig.selectColor;
        highLightSpan.innerHTML = highLightText(this.searchText, text, color);
        highLightSpan.dataset.originText = text;
        // 替换原来的textNode 为 高亮后的span 元素
        span.replaceChild(highLightSpan, node);
      }
    }
  }
  // 自定义取消高亮
  clearHighLight() {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        const span =
          this.searchType === SearchType.user
            ? this.getNameSpanByMsg(item)
            : this.getChatSpanByMsg(item);
        const highLightList = span.querySelectorAll("[data-origin-text]");
        highLightList.forEach((node) => {
          const textNode = document.createTextNode(node.dataset.originText);
          span.replaceChild(textNode, node);
        });
      });
      resolve();
    });
  }
  // 获取用户名span
  getNameSpanByMsg(msg) {}
  // 获取内容span
  getChatSpanByMsg(msg) {}
  // 自定义查询定位
  scrollTo(index) {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!textDom) {
        console.log("index 错误");
        reject();
        return;
      }
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
