import { createDocumentEl } from "../utils/util";

export class SearchPanel {
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
    this.loading = false;
  }
  create() {
    this.dom = createDocumentEl("div", { classList: [this.class] });
    this.dom.addEventListener("scroll", (e) => {
      const viewHeight = this.dom.clientHeight;
      const scrollTop = e.target.scrollTop;
      const bottom = this.dom.scrollHeight - (viewHeight + scrollTop);
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
    this.loading = true;
    this.onNext(this.searchPage)
      .then((res) => {
        if (res.length === 0 && next) {
          this.finish = true;
          return;
        }
        this.chatRecord = [...this.chatRecord, ...res];
        this.renderMessages();
      })
      .catch(() => {
        this.finish = true;
      })
      .finally(() => {
        this.loading = false;
      });
    this.searchPage.pageIndex++;
  }
  renderMessages() {
    this.dom.innerHTML = "";
    const itemList = this.chatRecord.map((msg) => {
      const item = createDocumentEl("div", {
        classList: ["lce-search-panel-message"],
      });
      const text = createDocumentEl("span");
      text.innerHTML = `${msg.user} ${msg.text}`;
      item.append(text);
      return item;
    });
    this.dom.append(...itemList);
  }
  renderMessageItem() {}
}
