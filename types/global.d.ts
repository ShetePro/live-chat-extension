type CreateDomOption = {
  classList?: string[];
  append?: HTMLElement[] | Node[] | string[];
};

type SettingConfig = {
  key: string;
  isOpen: boolean;
  defaultOpen: boolean;
  language: string;
  selectColor: string;
  fontSize: string;
  indexedDbCacheDay: string | number;
};

type ConfigResponse = {
  value: SettingConfig
}

type MessageElement = HTMLElement | Node | Element
