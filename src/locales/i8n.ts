import i18next from "i18next";

export let i18nConfig = {
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        setting: "Setting",
        user: "User",
        chat: "Chat",
        selectTextColor: "Select color",
        languages: "Languages",
        isDefaultOpen: "Enabled by default",
        isOpen: "Is enabled",
        noMore: 'No More'
      },
    },
    cn: {
      translation: {
        setting: "设置",
        user: "用户",
        chat: "消息",
        selectTextColor: "选中颜色",
        languages: "语言",
        isDefaultOpen: "默认开启",
        isOpen: "是否打开",
        noMore: "没有更多了"
      },
    },
  },
};


export function setI18nConfig(config = {}) {
  i18nConfig = {
    ...i18nConfig,
    ...config,
  };
  i18next.init(i18nConfig);
}

export function i18Text(key: string): string {
  return i18next.t(key as any);
}
