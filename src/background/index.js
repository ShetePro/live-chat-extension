console.log('background')
// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getURL" && request.path) {
    let url = chrome.runtime.getURL(request.path);
    sendResponse({ url: url });
  }
});
