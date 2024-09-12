export function setChromeStorage (key: string, value: Record<string, any>) {
  chrome.storage.local.set({ [key]: value }).then(() => {
    console.log("Value is set");
  });
}
