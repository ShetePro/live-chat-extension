export function createDocumentEl(tag, option) {
  const { classList = [], append = [] } = option || {};
  const dom = document.createElement(tag);
  dom.classList.add(...classList);
  dom.append(...append);
  return dom;
}
// 获取配置信息
export function getConfig() {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type: "getData", key: "config" },
        (response) => {
          console.log("config data:", response);
          resolve(response);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
