import { watchChromeStorage } from "@/background/util";
import { ExtensionConfig } from "@/background/config";

export function watchConfig(getControl: any, init: (config: SettingConfig) => void): Promise<SettingConfig> {
  return new Promise((resolve, reject) => {
    try {
      watchChromeStorage((changes) => {
        const liveControl= getControl()
        const { newValue, oldValue } = changes[ExtensionConfig.key];
        liveControl?.changeConfig(newValue);
        if (newValue.selectColor !== oldValue.selectColor) {
          console.log('设置颜色')
          liveControl.clearHighLight().then(() => {
            liveControl.highLight();
          });
        }
        if (newValue.fontSize !== oldValue.fontSize) {
          liveControl.changeFontSize(newValue.fontSize);
          console.log('设置字体')
        }
        if (newValue.language !== oldValue.language) {
          init(newValue);
        }
        resolve(newValue);
      });
    } catch (e) {
      reject(e);
    }
  });
}
