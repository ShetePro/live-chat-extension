import "./index.css";
import { getConfig } from "../utils/util";
import { watchConfig } from "../utils/configWatcher";
import { setI18nConfig } from "../locales/i8n";
import { LiveSearch } from "./LiveSearch";
import { SiteType } from "../enum";

let contentConfig: SettingConfig | null = null;
let liveControl: DouyuSearch = null;
let asideObserve: MutationObserver | null = null;
setTimeout(() => {
  // 斗鱼使用懒加载append弹幕列表 所以一开始并不能获取
  // 通过监听节点的添加来获取init 初始化的时间
  const targetNode = document.querySelector("#js-player-asideMain");
  const config = { childList: true, subtree: true };
  asideObserve = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const { addedNodes } = mutation;
        let open = false;
        for (const node of addedNodes) {
          const el = node.parentElement as HTMLElement;
          open = !!el.querySelector(".Barrage-list");
        }
        if (open) {
          getConfig().then(({ value }) => {
            contentConfig = value;
            init();
            closeLoadWatch();
          });
        }
      }
    }
  });
  asideObserve.observe(targetNode, config);
}, 1000);
function closeLoadWatch() {
  asideObserve?.disconnect();
  asideObserve = null;
}
watchConfig((request: SettingConfig) => {
  contentConfig = request;
  init();
});

function init() {
  setI18nConfig({
    lng: contentConfig?.language,
  });
  if (contentConfig?.isOpen) {
    searchInit();
  } else {
    liveControl?.destroy();
  }
}
function searchInit() {
  liveControl?.destroy();
  liveControl = new DouyuSearch(contentConfig);
}
export class DouyuSearch extends LiveSearch {
  constructor(config: SettingConfig) {
    super(config);
    // 设置chat list 选择器
    this.listSelector = "#js-barrage-list";
    this.siteType = SiteType.douyu;
    this.liveId = this.href[0];
    this.liveName = (
      document.querySelector(".Title-anchorNameH2") as HTMLElement
    )?.textContent;
    this.chatListDom = document.querySelector(this.listSelector);
    this.init();
  }

  getNameSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".Barrage-nickName") as HTMLElement;
  }
  // 获取内容span
  getChatSpanByMsg(msg: HTMLElement) {
    return msg?.querySelector(".Barrage-content") as HTMLElement;
  }
  // 重写查询定位
  scrollTo(index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const textDom = this.searchList[index - 1];
      if (!this.chatListDom) return;
      if (!textDom) {
        console.log("index 错误", index);
        reject();
        return;
      }
      const scrollWrapper = this.chatListDom.parentElement;
      scrollWrapper.scrollTo(0, textDom.offsetTop);
      resolve();
    });
  }
}
