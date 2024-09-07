import { createDocumentEl, getImageSrc } from "../utils/util";
import { i18Text } from "../locales/i8n";
import loadingSvg from "/public/loading.svg";
export type SearchPageType = {
  pageIndex: number;
  pageSize: number;
};
export class SearchPanel {
  class: string;
  chatRecord: any[];
  dom: HTMLElement | null;
  onNext: (params: SearchPageType) => Promise<any[]>;
  searchPage: SearchPageType;
  offsetTop: number;
  finish: boolean;
  finishText: HTMLElement;
  loading: boolean;
  loadingIcon: HTMLElement | null;
  constructor(opt) {
    this.class = "lce-search-panel";
    this.chatRecord = [];
    this.dom = null;
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
    this.loadingIcon = createDocumentEl("div", {classList: ['lce-search-panel-loading']});
    this.loading = false;
  }
  create() {
    this.dom = createDocumentEl("div", { classList: [this.class] });
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
    this.finish = false;
    this.chatRecord = [];
    this.searchPage.pageIndex = 1;
    this.search();
  }
  hide() {
    this.dom?.classList.remove("show-panel");
    this.chatRecord = [];
    this.searchPage.pageIndex = 1;
    this.finish = false;
  }
  search({ next } = {}) {
    if (!next) {
      this.chatRecord = [];
    }
    if (this.finish) return;
    this.setLoading(true);
    this.onNext(this.searchPage)
      .then((res) => {
        const len = res.length;
        if (len === 0 && next) {
          this.finish = true;
          this.setFinishText();
          return;
        } else if (len < this.searchPage.pageSize) {
          this.finish = true;
          this.setFinishText();
        } else {
          this.finish = false;
        }
        this.chatRecord = [...this.chatRecord, ...res];
        this.renderMessages();
      })
      .catch((e) => {
        this.finish = true;
        console.error(e);
      })
      .finally(() => {
        this.setLoading(false)
      });
    this.searchPage.pageIndex++;
  }
  renderMessages() {
    if (!this.dom) return;
    this.dom.innerHTML = "";
    const itemList = this.chatRecord.map((msg) => {
      const item = createDocumentEl("div", {
        classList: ["lce-search-panel-message"],
      });
      const text = createDocumentEl("span");
      const isSeparation =
        msg?.user?.indexOf(":") >= 0 || msg?.user?.indexOf("：") >= 0;
      text.innerHTML = `${msg.user + (isSeparation ? "" : "：")} ${msg.text}`;
      item.append(text);
      return item;
    });
    this.dom.append(...itemList);
    this.setFinishText();
  }
  setFinishText() {
    if (this.finish) {
      this.dom?.append(this.finishText);
    } else {
      this.finishText?.remove();
    }
  }
  setLoading(load: boolean) {
    this.loading = load;
    if (this.loading && this.loadingIcon) {
      const url = getImageSrc(loadingSvg);
      if (!url) return;
      this.loadingIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width="50" height="50" style="shape-rendering: auto; display: block; background: rgb(255, 255, 255);" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path stroke="none" fill="#00cc99" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50">
  <animateTransform values="0 50 51;360 50 51" keyTimes="0;1" repeatCount="indefinite" dur="1s" type="rotate" attributeName="transform"></animateTransform>
</path><g></g></g></svg>`;
      this.dom?.append(this.loadingIcon);
    } else {
      this.loadingIcon?.remove();
    }
  }
}
