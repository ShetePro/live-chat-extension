import { createDocumentEl, debounce, injectShadowStyle } from "@/utils/util";
import { SearchPageType, SearchPanel } from "./searchPanel";
import { BasicIndexDb } from "@/modules/IDB/indexDb";
import { SearchType, SiteType } from "@/enum";
import { i18Text } from "@/locales/i8n";
import { ChatMessageType } from "@/modules/IDB/type";
// @ts-ignore
import Styles from "./index.css?inline";
import { setThemeMode } from "@/utils/theme";

type SearchBoxOption = {
  indexDb: BasicIndexDb;
  x: number;
  y: number;
  searchCallback: (data: any) => Promise<{ index: number; total: number }>;
  position: (index: number) => Promise<any>;
  liveId: string;
  siteType: SiteType;
  fontSize?: string;
  theme?: ThemeField;
};
export class SearchBox {
  option: SearchBoxOption;
  isSearch: boolean;
  indexDb: BasicIndexDb | null;
  searchText: string;
  index: number;
  total: number;
  type: SearchType;
  offset: any;
  x: number;
  y: number;
  cnFlag: boolean;
  searchBox: HTMLElement;
  searchPanel: SearchPanel | null;
  fontSize: string;
  theme: ThemeField;
  constructor(opt: SearchBoxOption) {
    this.option = opt;
    this.isSearch = false;
    this.indexDb = opt.indexDb;
    this.fontSize = opt.fontSize;
    this.theme = opt.theme;
    this.searchText = "";
    this.index = 0;
    this.total = 0;
    this.type = SearchType.message;
    this.offset = {};
    this.x = opt.x || 0;
    this.y = opt.y || 0;
    this.cnFlag = false;
    this.searchBox = document.createElement("div");
    this.searchPanel = new SearchPanel({
      onNext: (params: SearchPageType) => {
        return this.searchByIndexedDB.call(this as SearchBox, params);
      },
    });
  }
  setTheme(e: boolean) {
    this.searchBox?.classList.remove("dark", "light");
    this.searchBox?.classList.add(e ? "dark" : "light");
  }
  // 拖拽事件
  drag(e: MouseEvent) {
    const { x, y } = e;
    const maxX = window.innerWidth - this.searchBox?.clientWidth;
    const maxY = window.innerHeight - this.searchBox?.clientHeight;
    this.x = Math.max(0, Math.min(x - this.offset.x, maxX));
    this.y = Math.max(0, Math.min(y - this.offset.y, maxY));
    this.setStyle();
  }
  // 设置样式
  setStyle() {
    this.searchBox?.setAttribute(
      "style",
      `--fontSize: ${this.fontSize}; transform: translate(${this.x}px, ${this.y}px`,
    );
  }
  setFontSize(fontSize: string) {
    this.fontSize = fontSize;
    this.setStyle();
  }
  renderSearch() {
    console.log("显示直播弹幕查询");
    this.searchBox.classList.add("lce-search-box");
    setThemeMode(this.theme, (e) => this.setTheme(e));
    const main = document.createElement("div");
    const panel = this.searchPanel?.create();
    panel && this.searchBox.append(panel);
    // 使用shadow dom
    const shadowRoot = main.attachShadow({ mode: "open" });
    shadowRoot.append(this.searchBox);
    injectShadowStyle(shadowRoot, Styles);
    document.body.append(main);
    this.setStyle();
    this.renderTypeSelect();
    this.renderInput();
    this.renderTotal();
    this.renderBtn();
    const moveCallback = (e: MouseEvent) => this.drag(e);
    // 设置拖拽移动
    this.searchBox.addEventListener(
      "mousedown",
      (e) => {
        console.log("mousedown", e);
        const { left, top } = this.searchBox?.getBoundingClientRect();
        this.offset = {
          x: e.x - left,
          y: e.y - top,
        };
        document.body.addEventListener("mousemove", moveCallback);
      },
      true,
    );
    // 取消拖拽事件
    document.body.addEventListener("mouseup", () => {
      document.body.removeEventListener("mousemove", moveCallback);
    });
  }
  renderTypeSelect() {
    const box = createDocumentEl("div", {
      classList: ["lce-type-select"],
    });
    const userBox = createDocumentEl("div", {
      classList: ["lce-type-select-user", "lce-type-box"],
      append: [i18Text("user")],
    });
    const messageBox = createDocumentEl("div", {
      classList: ["lce-type-select-message", "lce-type-box"],
      append: [i18Text("chat")],
    });
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
      this.search();
    });
    this.searchBox?.append(box);
  }
  renderInput() {
    const box = createDocumentEl("input", {
      classList: ["lce-input"],
      append: [],
    });
    // 取消按键冒泡 防止输入时触发快捷键
    box.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });
    box.addEventListener("keyup", (e) => {
      e.stopPropagation();
    });
    box.addEventListener("compositionstart", () => {
      console.log("start");
      this.cnFlag = true;
    });
    box.addEventListener("input", debounce(this.searchTextEvent, 0, this));
    box.addEventListener("compositionend", () => {
      console.log("end");
      this.cnFlag = false;
      this.search();
    });
    this.searchBox?.append(box);
  }
  renderTotal() {
    let span = this.searchBox?.querySelector(".index-total") as HTMLElement;
    if (!span) {
      span = createDocumentEl("span", {
        classList: ["index-total"],
      });
      this.searchBox?.append(span);
    }
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
    // const close = createDocumentEl("div", {
    //   classList: ["lce-btn", "close-icon"],
    // });
    const group = createDocumentEl("div", {
      classList: ["lce-btn-group"],
      append: [previous, next],
    });
    next.addEventListener("click", () => this.next());
    previous.addEventListener("click", () => this.previous());
    this.searchBox?.append(group);
  }
  searchTextEvent() {
    const target = this.searchBox.querySelector(".lce-input");
    if (!target) return;
    const { value } = target as HTMLInputElement;
    this.searchText = value;
    this.isSearch = this.searchText?.length > 0;
    if (!this.cnFlag) {
      this.search();
    }
  }
  updateSearchPanelMessage(msg: ChatMessageType) {
    this.searchPanel?.updateRecord(msg);
  }
  searchByIndexedDB({
    pageIndex = 1,
    pageSize = 20,
  }: SearchPageType): Promise<ChatMessageType[]> {
    return new Promise((resolve, reject) => {
      // 数据库查询逻辑
      this.indexDb
        ?.getPageBySiteType({
          pageIndex,
          pageSize,
          siteType: this.option.siteType,
          liveId: this.option.liveId,
          text: this.searchText,
          type: this.type,
        })
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  search() {
    // 数据库查询
    if (this.searchText) {
      this.searchPanel?.show();
    } else {
      this.searchPanel?.hide();
    }
    // dom查询逻辑
    this.option
      .searchCallback({ text: this.searchText, type: this.type })
      .then(({ index, total }) => {
        this.index = index;
        this.total = total;
        this.renderTotal();
      });
  }
  next() {
    this.index = this.index >= this.total ? 1 : this.index + 1;
    this.option.position?.(this.index).then(() => {
      this.renderTotal();
    });
  }
  previous() {
    this.index = this.index <= 1 ? this.total : this.index - 1;
    this.option.position?.(this.index).then(() => {
      this.renderTotal();
    });
  }
  remove() {
    this.searchBox?.remove();
  }
}
