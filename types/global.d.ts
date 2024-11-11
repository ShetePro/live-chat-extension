type CreateDomOption = {
  classList?: string[];
  append?: HTMLElement[] | Node[] | string[];
};

type SettingConfig = {
  key: string;
  isOpen: boolean;
  language: string;
  selectColor: string;
  fontSize: string;
  indexedDbCacheDay: string;
  theme: ThemeField;
};

type ConfigResponse = {
  value: SettingConfig;
};

type MessageElement = HTMLElement & Element;

type ThemeField = 'system' | 'dark' | 'light';
