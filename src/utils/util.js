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
// 修改配置信息
export function setConfig(value, { merge = false }) {
  return new Promise((resolve, reject) => {
    try {
      
      chrome.runtime.sendMessage(
        {
          type: "setData",
          key: "config",
          props: {
            merge
          },
          value: { ...value },
        },
        (response) => {
          resolve(response);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}

// by string return high light html
export function highLightText(search, text, color) {
  const regex = new RegExp(search, "g");
  return text.replace(
    regex,
    `<span style="background: ${color}">${search}</span>`,
  );
}

// watch chat list message push
export function observerListPush(dom, callback) {
  if (dom.nodeType === 1) {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          callback(mutation);
        }
      }
    });
    observer.observe(dom, {
      attributes: false,
      childList: true,
      subtree: false,
    });
    return observer;
  } else {
    console.error("observer require is dom object");
  }
  return null;
}
