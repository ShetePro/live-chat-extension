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
        selectColorText: "Select color",
        selectColorDescription: "Set the query highlight color in local chat",
        languages: "Languages",
        isDefaultOpen: "Enabled by default",
        isOpen: "Enable plugin",
        noMore: "No More",
        fontSizeSetting: "Font size",
        indexedDbCacheSetting: 'Cache duration',
        indexedDbCacheSettingDescription: 'Set the duration for caching live message content in the local database。(unit: day)',
        dayUnit: 'day'
      },
    },
    cn: {
      translation: {
        setting: "设置",
        user: "用户",
        chat: "消息",
        selectColorText: "选中颜色",
        selectColorDescription: "设置本地聊天中查询高亮颜色",
        languages: "语言",
        isDefaultOpen: "默认开启",
        isOpen: "启用插件",
        noMore: "没有更多了",
        fontSizeSetting: "字体大小",
        indexedDbCacheSetting: '缓存时长',
        indexedDbCacheSettingDescription: '设置本地数据库缓存直播消息内容的时长。(单位: 天)',
        dayUnit: '天'
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
