import { createDocumentEl } from "../utils/util.js";
let searchBox;
export function createSearchBox() {
  const box = document.createElement("div");
  box.classList.add("lce-search-box");
  document.body.append(box);
  searchBox = box;
  console.log("显示直播弹幕查询");
  renderTypeSelect();
  renderInput();
  renderBtn();
}

export function renderTypeSelect() {
  const box = createDocumentEl("div", {
    classList: ["lce-type-select"],
    append: ["弹幕"],
  });
  searchBox.append(box);
}
export function renderInput() {
  const box = createDocumentEl("input", {
    classList: ["lce-input"],
    append: [],
  });
  searchBox.append(box);
}

export function renderBtn() {
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
  searchBox.append(group);
}
