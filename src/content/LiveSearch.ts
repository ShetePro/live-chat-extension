import { SearchBox } from "./searchBox";
import {
  createDocumentEl,
  highLightText,
  observerListPush,
} from "@/utils/util";
import { BasicIndexDb } from "@/modules/IDB/indexDb";
import { SearchType, SiteType } from "@/enum";
import { ChatMessageType } from "@/modules/IDB/type";
import {handleTheme} from "@/utils/theme";

export abstract class LiveSearch {
  liveData: Record<string, any>[];
  contentConfig: SettingConfig;
  observer: null | MutationObserver;
  searchBox: null | SearchBox;
  searchList: any[];
  searchText: string;
  searchType: SearchType;
  searchTextTop: number;
  iframe: HTMLIFrameElement | null | undefined;
  chatListDom: HTMLElement | Element | null;
  listSelector: string;
  indexDb: BasicIndexDb | null;
  liveId: string;
  liveName: string;
  liveAvatar: string | undefined;
  siteType: SiteType | undefined;
  href: string | string[];
  // 获取用户名span
  abstract getNameSpanByMsg(msg: MessageElement): HTMLElement;
  // 获取内容span
  abstract getChatSpanByMsg(msg: MessageElement): HTMLElement;
  abstract scrollTo(index: number): Promise<any>;
  protected constructor(config: SettingConfig) {
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
    this.indexDb = new BasicIndexDb({ cacheDays: config.indexedDbCacheDay });
    this.liveId = "";
    this.liveName = "";
    this.href = location.href.split("/")?.at(-1).split("?");
  }
  changeConfig(config: SettingConfig) {
    this.contentConfig = config;
  }
  init() {
    // 处理使用iframe 嵌套直播间
    if (!this.chatListDom) {
      const iframes: NodeListOf<HTMLIFrameElement> =
        document.body.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        let list =  iframe.contentDocument.querySelector(this.listSelector);
        if (list) {
          this.chatListDom = list as HTMLElement;
          this.iframe = iframe;
          this.renderSearch();
        } else {
          this.awaitIframeLoad(iframe);
        }
      });
    } else {
      this.renderSearch();
    }
  }
  awaitIframeLoad(iframe: HTMLIFrameElement) {
    if (iframe.contentDocument) {
      iframe.addEventListener("load", () => {
        const list = iframe.contentDocument.querySelector(this.listSelector);
        if (list) {
          this.chatListDom = list;
          this.iframe = iframe;
          this.renderSearch();
        }
      });
    }
  }
  renderSearch() {
    this.searchBox = new SearchBox({
      indexDb: this.indexDb,
      x: window.innerWidth - 500,
      y: window.innerHeight * 0.4,
      liveId: this.liveId,
      siteType: this.siteType,
      searchCallback: (data: any) => this.search(data),
      position: (index: number) => this.scrollTo(index),
      fontSize: this.contentConfig.fontSize,
      theme: this.contentConfig.theme,
    });
    this.searchBox.renderSearch();
    this.indexDb?.init().then(() => {
      // watch chat list push msg
      console.log("开启IndexDb监听");
      this.watchMessage();
    });
  }
  setTheme (theme: ThemeField) {
    const isDark = handleTheme(theme)
    this.searchBox?.setTheme(isDark)
  }
  destroy() {
    this.clearHighLight().then(() => {
      this.searchBox?.remove();
      this.observer?.disconnect();
      this.indexDb = null;
    });
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
      const list: HTMLCollection = this.chatListDom?.children;
      this.searchType = type;
      try {
        await this.clearHighLight();
        if (text !== "") {
          this.searchText = text;
          this.searchList = [];
          for (const chat of list) {
            this.pushMsgBySearch(chat as MessageElement);
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
  pushMsgBySearch(msg: MessageElement) {
    console.log(msg);
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
      addedNodes?.forEach((lastMsg: Node) => {
        if (this.searchText) {
          const add = this.pushMsgBySearch(lastMsg as MessageElement);
          if (add) {
            // 高亮
            this.highLightMsg(lastMsg as MessageElement);
            const msg = this.getChatMessageParams(lastMsg as MessageElement);
            this.searchBox?.updateSearchPanelMessage(msg);
            this.searchText && this.clearRemoveMsgNode();
            if (this.searchBox) {
              this.searchBox.total = this.searchList.length;
              this.searchBox.renderTotal();
            }
          }
        }
        // 默认将聊天内容记录在indexDb
        this.pushMsgDatabase(lastMsg as MessageElement);
      });
    });
  }
  pushMsgDatabase(msg: MessageElement) {
    const params: ChatMessageType = this.getChatMessageParams(msg);
    params.text && this.indexDb?.push(params);
  }
  getChatMessageParams(msg: MessageElement): ChatMessageType {
    return {
      user: this.getNameSpanByMsg(msg)?.innerText,
      text: this.getChatSpanByMsg(msg)?.innerText,
      userId: this.getUserIdByMsg?.(msg) || "",
      userAvatar: this.getUserAvatarByMsg?.(msg) || "",
      timestamp: new Date().getTime(),
      siteType: this.siteType,
      liveId: this.liveId || "",
      liveName: this.liveName || "",
      liveAvatar: this.liveAvatar || "",
    };
  }
  getUserIdByMsg(msg: MessageElement): string {
    return msg.dataset?.userId;
  }
  getUserAvatarByMsg(msg: MessageElement): string {
    const img = msg.querySelector("img");
    return img?.src;
  }
  getScrollBar() {
    let list = document.body.querySelector("#chatRoom");
    if (this.iframe && !list) {
      list = this.iframe?.contentDocument?.querySelector("#chatRoom");
    }
    return list?.querySelector(".scroll_move");
  }
  highLight(): Promise<void> {
    return new Promise((resolve) => {
      this.searchList.forEach((item) => {
        this.highLightMsg(item);
      });
      resolve();
    });
  }
  // 自定义高亮
  highLightMsg(item: MessageElement) {
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
    return new Promise<void>((resolve) => {
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
  changeFontSize(fontSize: string) {
    this.searchBox.setFontSize(fontSize);
  }
}
