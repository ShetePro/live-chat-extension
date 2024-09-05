import { SearchBox } from "./searchBox";
import {
  createDocumentEl,
  highLightText,
  observerListPush,
} from "../utils/util";
import { BasicIndexDb } from "../modules/IDB/indexDb";
import { SearchType, SiteType } from "../enum";

export abstract class LiveSearch {
  liveData: Record<string, any>[];
  contentConfig: SettingConfig;
  observer: null | MutationObserver;
  searchBox: null | SearchBox;
  searchList: any[];
  searchText: string;
  searchType: SearchType;
  searchTextTop: number;
  iframe: HTMLIFrameElement | null;
  chatListDom: HTMLElement | null;
  listSelector: string;
  indexDb: BasicIndexDb | null;
  liveId: string;
  liveName: string;
  siteType: SiteType;
  href: string;
  // 获取用户名span
  abstract getNameSpanByMsg(msg): HTMLElement;
  // 获取内容span
  abstract getChatSpanByMsg(msg): HTMLElement;
  abstract scrollTo(msg): Promise<any>;
  constructor(config) {
    this.contentConfig = config;
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
    this.liveName = "";
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
          this.chatListDom = list as HTMLElement;
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
      this.chatListDom?.getBoundingClientRect();
    this.searchBox = new SearchBox({
      indexDb: this.indexDb,
      x: left + 10,
      y: top,
      liveId: this.liveId,
      siteType: this.siteType,
      searchCallback: (data) => this.search(data),
      position: (index) => this.scrollTo(index),
    });
    this.searchBox.renderSearch();
    this.indexDb?.init().then(() => {
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
      const list = this.chatListDom?.children;
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
    const name = this.getNameSpanByMsg(msg).innerText;
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
  // 清理chat列表清除的消息
  clearRemoveMsgNode() {
    for (let i = 0; i < this.searchList.length; i++) {
      if (this.searchList[0].isConnected) {
        return;
      } else {
        this.searchList.shift();
      }
    }
  }
  watchMessage() {
    if (this.observer || !this.chatListDom) return;
    this.observer = observerListPush(this.chatListDom, (mutation) => {
      const { addedNodes } = mutation;
      addedNodes?.forEach((lastMsg) => {
        if (this.searchText) {
          const add = this.pushMsgBySearch(lastMsg);
          if (add) {
            // 高亮
            this.highLightMsg(lastMsg);
            this.searchText && this.clearRemoveMsgNode();
            if (this.searchBox) {
              this.searchBox.total = this.searchList.length;
              this.searchBox.renderTotal();
            }
          }
        }
        // 默认将聊天内容记录在indexDb
        this.pushMsgDatabase(lastMsg);
      });
    });
  }
  pushMsgDatabase(msg) {
    let anchor = this.getNameSpanByMsg(msg)?.innerText,
      text,
      time = new Date().getTime();
    text = this.getChatSpanByMsg(msg)?.textContent;
    text &&
      this.indexDb?.push({
        user: anchor,
        text,
        timestamp: time,
        siteType: this.siteType,
        liveId: this.liveId || "",
        liveName: this.liveName || "",
      });
  }
  getScrollBar() {
    let list = document.body.querySelector("#chatRoom");
    if (this.iframe && !list) {
      list = this.iframe?.contentDocument?.querySelector("#chatRoom");
    }
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
        const highLightList = span?.querySelectorAll("[data-origin-text]");
        highLightList?.forEach((node) => {
          const dataset = (node as HTMLElement).dataset;
          const textNode = document.createTextNode(dataset.originText);
          span.replaceChild(textNode, node);
        });
      });
      resolve();
    });
  }
}
