type CreateDomOption = {
  classList?: string[];
  append?: HTMLElement[] | Node[] | string[];
};

type SettingConfig = {
  isOpen: boolean;
  defaultOpen: boolean;
  language: string;
  selectColor: string;
};

type ConfigResponse = {
  value: SettingConfig
}
