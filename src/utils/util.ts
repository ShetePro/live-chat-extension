export function createDocumentEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  option?: CreateDomOption,
): HTMLElementTagNameMap[K] {
  const { classList = [], append = [] } = option || {};
  const dom = document.createElement(tag);
  dom.classList.add(...classList);
  dom.append(...append);
  return dom;
}
// 获取配置信息
export function getConfig(): Promise<ConfigResponse> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type: "getData", key: "config" },
        (response) => {
          console.log("config data:", response);
          resolve(response as ConfigResponse);
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
// 修改配置信息
export function setConfig(value: Record<string, any>, props: null | {} = null) {
  return new Promise((resolve, reject) => {
    try {
      const { merge = true } = props || {
        merge: true,
      };
      chrome.runtime.sendMessage(
        {
          type: "setData",
          key: "config",
          props: {
            merge,
          },
          value,
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
export function highLightText(search: string, text: string, color: string) {
  const regex = new RegExp(search, "g");
  return text.replace(
    regex,
    `<span style="background: ${color}">${search}</span>`,
  );
}

// watch chat list message push
export function observerListPush(
  dom: Element,
  callback: (mutation: MutationRecord) => void,
) {
  if (dom?.nodeType === 1) {
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

// 获取静态资源地址 解决浏览器插件和页面中的地址冲突
export function getImageSrc (src: string): string | null {
  if (src) {
    return chrome.runtime.getURL(src)
  }
  return null
}
