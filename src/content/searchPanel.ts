import { createDocumentEl } from "../utils/util";
import { i18Text } from "../locales/i8n";
import { ChatMessageType } from "../modules/IDB/type";
export type SearchPageOption = {
  onNext: (params: SearchPageType) => Promise<ChatMessageType[]>;
};
export type SearchPageType = {
  pageIndex: number;
  pageSize: number;
};
export class SearchPanel {
  class: string;
  chatRecord: any[];
  dom: HTMLElement | null;
  listDom: HTMLElement;
  headerDom: HTMLElement;
  onNext: (params: SearchPageType) => Promise<ChatMessageType[]>;
  searchPage: SearchPageType;
  offsetTop: number;
  finish: boolean;
  finishText: HTMLElement;
  loading: boolean;
  loadingIcon: HTMLElement | null;
  constructor(opt: SearchPageOption) {
    this.class = "lce-search-panel";
    this.chatRecord = [];
    this.dom = null;
    this.headerDom = createDocumentEl("div", {
      classList: ["lce-search-panel-header"],
    });
    // this.bottomDom = createDocumentEl("div", {
    //   classList: ["lce-search-panel-bottom"],
    // });
    this.listDom = createDocumentEl("div", {
      classList: ["lce-search-panel-list"],
    });
    this.onNext = opt.onNext;
    this.searchPage = {
      pageIndex: 1,
      pageSize: 10,
    };
    this.offsetTop = 20;
    this.finish = false;
    this.finishText = createDocumentEl("span", {
      classList: [this.class + "-finish"],
      append: [i18Text("noMore")],
    });
    this.loadingIcon = createDocumentEl("div", {
      classList: ["lce-search-panel-loading"],
    });
    this.loading = false;
  }
  create() {
    this.dom = createDocumentEl("div", {
      classList: [this.class],
      append: [this.headerDom, this.listDom],
    });
    this.dom.addEventListener("scroll", (e) => {
      const viewHeight = this.dom?.clientHeight;
      const target = e.target as Element;
      const scrollTop = target.scrollTop;
      const bottom = this.dom?.scrollHeight - (viewHeight + scrollTop);
      if (!this.loading && !this.finish && bottom <= this.offsetTop) {
        console.log(bottom, "到底了");
        this.search({ next: true });
      }
    });
    return this.dom;
  }
  show() {
    this.dom?.classList.add("show-panel");
    this.setFinishText(false);
    this.chatRecord = [];
    this.searchPage.pageIndex = 1;
    this.search();
  }
  hide() {
    this.dom?.classList.remove("show-panel");
    this.chatRecord = [];
    this.searchPage.pageIndex = 1;
    this.setFinishText(false);
    setTimeout(() => {
      this.listDom.innerHTML = "";
    });
  }
  updateRecord(msg: ChatMessageType) {
    this.chatRecord.push(msg);
    this.setFinishText(false);
    this.renderMessages([msg]);
    this.setFinishText(true);
  }
  search({ next }: { next?: boolean } = {}) {
    if (!next) {
      this.chatRecord = [];
      this.listDom.innerHTML = "";
    }
    if (this.finish) return;
    this.setLoading(true);
    this.onNext(this.searchPage)
      .then((res) => {
        const len = res.length;
        if (len === 0 && next) {
          this.setFinishText(true);
          return;
        } else if (len < this.searchPage.pageSize) {
          this.setFinishText(true);
        } else {
          this.setFinishText(false);
        }
        this.chatRecord = [...this.chatRecord, ...res];
        this.renderMessages(res);
      })
      .catch((e) => {
        this.setFinishText(true);
        console.error(e);
      })
      .finally(() => {
        this.setLoading(false);
      });
    this.searchPage.pageIndex++;
  }
  renderMessages(list: ChatMessageType[]) {
    if (!this.listDom) return;
    this.listDom.setAttribute(
      "style",
      `flex: ${this.chatRecord.length === 0 ? 0 : 1}`,
    );
    const itemList = list.map((msg) => {
      const item = createDocumentEl("div", {
        classList: ["lce-search-panel-message"],
      });
      const isSeparation =
        msg?.user?.indexOf(":") >= 0 || msg?.user?.indexOf("：") >= 0;
      if (msg.userAvatar) {
        const avatar = document.createElement("img");
        avatar.classList.add("avatar");
        avatar.src = msg.userAvatar;
        item.appendChild(avatar);
      }
      const content = createDocumentEl("div", { classList: ["content"] });
      content.innerHTML = `<span>${msg.user + (isSeparation ? "" : "：")}</span> <span>${msg.text}</span>`;
      item.append(content);
      return item;
    });
    this.listDom.append(...itemList);
    this.setFinishText(this.finish);
  }
  setFinishText(finish: boolean) {
    this.finish = finish;
    if (this.finish) {
      this.listDom?.append(this.finishText);
    } else {
      this.finishText?.remove();
    }
  }
  setLoading(load: boolean) {
    this.loading = load;
    if (this.loading && this.loadingIcon) {
      this.loadingIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="50" height="50" style="shape-rendering: auto; display: block; background: rgb(255, 255, 255);" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path stroke="none" fill="#00cc99" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50">
  <animateTransform values="0 50 51; 180 50 51; 360 50 51" keyTimes="0; 0.5; 1" repeatCount="indefinite" dur="1s" type="rotate" attributeName="transform"></animateTransform>
</path><g></g></g></svg>`;
      this.listDom?.append(this.loadingIcon);
    } else {
      this.loadingIcon?.remove();
    }
  }
}
