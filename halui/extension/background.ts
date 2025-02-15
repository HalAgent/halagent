chrome.action.onClicked.addListener((tab) => {
  console.warn(tab)
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error))
})
