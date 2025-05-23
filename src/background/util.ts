import { ExtensionConfig } from "@/background/config";

export function setChromeStorage(key: string, value: Record<string, any>) {
  chrome.storage.local.set({ [key]: value }).then(() => {
    console.log("Value is set", arguments);
  });
}

export function getChromeStorage(key: string): Promise<SettingConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key]).then((result) => {
      console.log("Value is ", result);
      resolve(result[key] || ExtensionConfig);
    });
  });
}

export function watchChromeStorage(callback: {
  (changes: { [x: string]: { newValue: any; oldValue: any } }): void;
  (changes: { [key: string]: chrome.storage.StorageChange }): void;
}) {
  chrome.storage.local.onChanged.addListener(callback);
}
