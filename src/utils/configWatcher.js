
const callbacks = [];

export function watchConfig(callback, once = false) {
  if (typeof callback === "function") {
    callbacks.push(callback);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request,sender,sendResponse, "修改了config");
  callbacks.forEach(c => {
    queueMicrotask(() => {
      c(request)
    })
  })
});
