import { ExtensionConfig } from "./config";

console.log("background", 111111111111);
// background.js
const data = {};
data.config = ExtensionConfig;
console.log(data, "data");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getURL" && request.path) {
    let url = chrome.runtime.getURL(request.path);
    sendResponse({ url: url });
  }
});

// 数据共享化
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "setData") {
    const merge = request.props?.merge;
    data[request.key] = merge
      ? { ...data[request.key], ...request.value }
      : request.value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, data[request.key], (response) => {
        console.log(response.farewell);
      });
    });

    sendResponse({ status: "success" });
  } else if (request.type === "getData") {
    sendResponse({ value: data[request.key] });
  }
});
