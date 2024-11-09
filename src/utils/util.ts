import QuerySelectorConfig from "../../siteQuerySelectorConfig.json";
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
export function setConfig(
  value: Record<string, any>,
  props?: Record<string, any>,
) {
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
  console.log(dom, 'observe')
  if (dom?.nodeType === 1) {
    const observer = new MutationObserver((mutationsList) => {
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
export function getImageSrc(src: string): string | null {
  if (src) {
    return chrome.runtime.getURL(src);
  }
  return null;
}
export function debounce<T>(
  callback: (arg: T) => void,
  wait: number,
  that?: any,
): (arg: T) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (this: any, arg) {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback.call(that || this, arg);
    }, wait);
  };
}
export function is(val: any, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

export function isArray(val: any) {
  return val && Array.isArray(val);
}
export function isEmpty(val: any) {
  if (isArray(val) || isString(val)) {
    return val.length === 0;
  }

  if (val instanceof Map || val instanceof Set) {
    return val.size === 0;
  }

  if (isObject(val)) {
    return Object.keys(val).length === 0;
  }

  return false;
}
export function isObject(val: any) {
  return val !== null && is(val, "Object");
}
export function isString(val: any) {
  return is(val, "String");
}

export function getQuerySelectorConfig() {
  return QuerySelectorConfig;
}
export function injectShadowStyle (shadowRoot: ShadowRoot, styles: string) {
  if (shadowRoot instanceof ShadowRoot) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    shadowRoot.adoptedStyleSheets = [sheet];
  }
}
export function querySelector(query: string, parent?: Document): Element | null;
export function querySelector(query: string[], parent?: Document): Element | null;
export function querySelector(query: string[], parent?: Document): Element | null;
export function querySelector (query:any, parent?: Document): Element | null {
  parent = parent || document;
  if (isString(query)){
    query = query.split(',')
  }
  const firstQuery: string = query[0]
  const all = parent.querySelectorAll(firstQuery)
  return selectorNodeByQuery(all, query)
}
function selectorNodeByQuery (nodeList: NodeListOf<Element>, query: string[]) {
  for (const dom of nodeList) {
    const flag = query.some(q => {
      const selector = q.slice(1)
      if (q[0] === "#") {
        return dom.id !== selector
      }
      if (q[0] === ".") {
        return !dom.classList.contains(selector)
      }
      return dom.tagName !== selector
    })
    if (!flag) {
      return dom
    }
  }
}
export function getUrlQuery (params: string) {
  const search = location.search
  if (search) {
    const urlParams = new URLSearchParams(search);
    return urlParams.get(params)
  }
  return void 0
}
