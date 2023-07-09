// kudos to https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
const refreshContentScripts = async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts ?? []) {
    if (!cs.js) continue
    for (const tab of await chrome.tabs.query({ url: cs.matches })) {
      if (!tab.id) continue
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: cs.js
      })
    }
  }
}

export default refreshContentScripts
