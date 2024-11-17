import { watchChromeStorage } from "@/background/util";
import { ExtensionConfig } from "@/background/config";

export function watchConfig(
  getControl: any,
  init: (config: SettingConfig) => void,
): Promise<SettingConfig> {
  return new Promise((resolve, reject) => {
    try {
      watchChromeStorage((changes) => {
        const liveControl = getControl();
        const { newValue, oldValue } = changes[ExtensionConfig.key];
        const hasFn = diffConfigValue(newValue, oldValue);
        liveControl?.changeConfig(newValue);
        if (hasFn("isOpen")) {
          init(newValue);
        }
        if (hasFn("selectColor")) {
          liveControl.clearHighLight().then(() => {
            liveControl.highLight();
          });
        }
        if (hasFn('fontSize')) {
          liveControl.changeFontSize(newValue.fontSize);
        }
        if (hasFn('language')) {
          init(newValue);
        }
        if (hasFn('theme')) {
          liveControl.setTheme(newValue.theme);
        }
        resolve(newValue);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function diffConfigValue(newValue: any, oldValue: any) {
  return (prop: string) => {
    return newValue?.[prop] !== oldValue?.[prop];
  };
}
