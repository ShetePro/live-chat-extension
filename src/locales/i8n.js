import i18next from "i18next";

export let i18nConfig = {
  lng: "en", // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        setting: "Setting",
        user: "user",
        chat: "chat",
      },
      cn: {
        translation: {
          setting: "设置",
          user: "用户",
          chat: "消息",
        },
      },
    },
  },
};

export function setI18nConfig(config = {}) {
  i18nConfig = {
    ...i18nConfig,
    ...config,
  };
  i18next.init(i18next);
}
