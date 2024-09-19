export function setChromeStorage (key: string, value: Record<string, any>) {
  chrome.storage.local.set({ [key]: value }).then(() => {
    console.log("Value is set", arguments);
  });
}

export function getChromeStorage (key: string): Promise<SettingConfig> {
 return new Promise((resolve) => {
   console.log(chrome.storage)
   chrome.storage.local.get([key]).then((result) => {
     console.log("Value is " + result);
     resolve(result[key])
   });
 })
}
