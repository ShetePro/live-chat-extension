export function createOpenPoint () {
  const box = document.createElement('div')
  box.classList.add('lce-popup-point')
  const img = document.createElement("img")
  img.src = chrome.runtime.getURL('/assets/popup.png')
  box.append(img)
  document.body.append(box)
  
}
