import { createDocumentEl } from "../utils/util.js";

export class SearchBox {
  constructor(opt) {
    this.isSearch = false;
    this.searchText = "";
    this.index = 0;
    this.total = 0;
    this.cnFlag = false;
    this.searchBox = "";
    this.searchCallback = opt.searchCallback;
    this.position = opt.position;
    console.log(opt);
  }
  renderSearch() {
    console.log("显示直播弹幕查询");
    const box = document.createElement("div");
    box.classList.add("lce-search-box");
    document.body.append(box);
    this.searchBox = box;
    this.renderTypeSelect();
    this.renderInput();
    this.renderTotal();
    this.renderBtn();
  }
  renderTypeSelect() {
    const box = createDocumentEl("div", {
      classList: ["lce-type-select"],
      append: ["弹幕"],
    });
    this.searchBox.append(box);
  }
  renderInput() {
    const box = createDocumentEl("input", {
      classList: ["lce-input"],
      append: [],
    });
    box.addEventListener("compositionstart", () => {
      console.log("start");
      this.cnFlag = true;
    });
    box.addEventListener("input", (e) => this.searchTextEvent(e));
    box.addEventListener("compositionend", () => {
      console.log("end");
      this.cnFlag = false;
      this.search();
    });
    this.searchBox.append(box);
  }
  renderTotal() {
    let span = this.searchBox.querySelector(".index-total");
    if (!span) {
      span = createDocumentEl("span", {
        classList: ["index-total"],
      });
      this.searchBox.append(span);
    }
    console.log(this.isSearch, "is Search");
    if (this.isSearch) {
      span.style.display = "block";
      span.innerText = `${this.index} / ${this.total}`;
    } else {
      span.style.display = "none";
    }
  }
  renderBtn() {
    const previous = createDocumentEl("div", {
      classList: ["lce-btn", "previous-icon"],
    });
    const next = createDocumentEl("div", {
      classList: ["lce-btn", "next-icon"],
    });
    const close = createDocumentEl("div", {
      classList: ["lce-btn", "close-icon"],
    });
    const group = createDocumentEl("div", {
      classList: ["lce-btn-group"],
      append: [previous, next, close],
    });
    next.addEventListener("click", () => this.next());
    previous.addEventListener("click", () => this.previous());
    this.searchBox.append(group);
  }
  searchTextEvent(e) {
    this.searchText = e.target.value;
    this.isSearch = this.searchText?.length > 0;
    if (!this.cnFlag) {
      this.search();
    }
  }
  search() {
    this.searchCallback({ text: this.searchText }).then(({ index, total }) => {
      this.index = index;
      this.total = total;
      this.renderTotal();
      console.log("收到", index, total);
    });
  }
  next() {
    console.log("next", this);
    this.index = this.index >= this.total ? 1 : this.index + 1;
    this.position?.(this.index).then(() => {
      this.renderTotal();
    });
  }
  previous() {
    console.log("previous", this);
    this.index = this.index <= 1 ? this.total : this.index - 1;
    this.position?.(this.index).then(() => {
      this.renderTotal();
    });
  }
}
