import { createDocumentEl } from "../utils/util.js";
const SearchType = {
  user: 1,
  message: 2,
};
export class SearchBox {
  constructor(opt) {
    this.isSearch = false;
    this.searchText = "";
    this.index = 0;
    this.total = 0;
    this.type = opt.type || SearchType.message;
    this.offset = {};
    this.x = opt.x || 0;
    this.y = opt.y || 0;
    this.cnFlag = false;
    this.searchBox = null;
    this.searchCallback = opt.searchCallback;
    this.position = opt.position;
    console.log(opt, SearchType);
  }
  // 拖拽事件
  drag(e) {
    const { x, y } = e;
    const maxX = window.innerWidth - this.searchBox.clientWidth;
    const maxY = window.innerHeight - this.searchBox.clientHeight;
    this.x = Math.max(0, Math.min(x - this.offset.x, maxX));
    this.y = Math.max(0, Math.min(y - this.offset.y, maxY));
    this.setStyle();
  }
  // 设置样式
  setStyle() {
    this.searchBox.setAttribute(
      "style",
      `transform: translate(${this.x}px, ${this.y}px`,
    );
  }
  renderSearch() {
    console.log("显示直播弹幕查询");
    const box = document.createElement("div");
    box.classList.add("lce-search-box");
    document.body.append(box);
    this.searchBox = box;
    this.setStyle();
    this.renderTypeSelect();
    this.renderInput();
    this.renderTotal();
    this.renderBtn();
    const moveCallback = (e) => this.drag(e);
    // 设置拖拽移动
    this.searchBox.addEventListener(
      "mousedown",
      (e) => {
        const { left, top } = this.searchBox.getBoundingClientRect();
        this.offset = {
          x: e.x - left,
          y: e.y - top,
        };
        document.body.addEventListener("mouseover", moveCallback);
      },
      true,
    );
    // 取消拖拽事件
    document.body.addEventListener("mouseup", () => {
      document.body.removeEventListener("mouseover", moveCallback);
    });
  }
  renderTypeSelect() {
    const box = createDocumentEl("div", {
      classList: ["lce-type-select"],
    });
    const userBox = createDocumentEl("div", {
      classList: ["lce-type-select-user", "lce-type-box"],
      append: ["用户"],
    });
    const messageBox = createDocumentEl("div", {
      classList: ["lce-type-select-message", "lce-type-box"],
      append: ["弹幕"],
    });
    console.log(this.type);
    userBox.classList.add(
      this.type === SearchType.user ? "lce-type-show" : "lce-type-hide",
    );
    messageBox.classList.add(
      this.type === SearchType.message ? "lce-type-show" : "lce-type-hide",
    );
    box.append(userBox, messageBox);
    box.addEventListener("click", () => {
      this.type =
        this.type === SearchType.user ? SearchType.message : SearchType.user;
      const node =
        this.type === SearchType.user
          ? [userBox, messageBox]
          : [messageBox, userBox];
      node[0].classList.remove("lce-type-hide");
      node[0].classList.add("lce-type-show");
      node[1].classList.remove("lce-type-show");
      node[1].classList.add("lce-type-hide");
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
