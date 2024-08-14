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
  show(messages) {
    this.dom?.classList.add("show-panel");
    this.chatRecord = messages;
    this.renderMessages();
  }
  hide() {
    this.dom?.classList.remove("show-panel");
    this.chatRecord = [];
  }
  renderMessages() {
    this.dom.innerHTML = ''
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
