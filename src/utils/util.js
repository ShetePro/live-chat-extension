export function createDocumentEl(tag, option) {
  const { classList = [], append = [] } = option || {};
  const dom = document.createElement(tag);
  dom.classList.add(...classList);
  dom.append(...append);
  return dom;
}
