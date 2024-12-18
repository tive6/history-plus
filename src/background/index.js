chrome.sidePanel.setOptions({
  enabled: false,
})

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'chrome://history/',
    active: true,
  })
})
