import { createDocumentEl } from "../utils/util";

export class SearchPanel {
  constructor() {
    this.pageIndex = 1;
    this.pageSize = 10;
    this.class = "lce-search-panel";
    this.chatRecord = [];
    this.dom = null;
  }
  create() {
    this.dom = createDocumentEl("div", { classList: [this.class] });
    return this.dom;
  }
  show() {
    this.dom?.classList.add("show-panel");
  }
  hide() {
    this.dom?.classList.remove("show-panel");
  }
}
