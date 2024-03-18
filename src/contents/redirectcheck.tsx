import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
;(() => {
  function gup(name: string, url: string) {
    const n = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
    const u = url || location.href

    const regexS = `[\\?&]${n}=([^&#]*)`
    const regex = new RegExp(regexS)
    const results = regex.exec(u)

    return results == null ? null : results[1]
  }

  window.addEventListener("load", () => {
    if (window.location.search.indexOf("partnerurl=") > -1) {
      const url = decodeURIComponent(gup("partnerurl", location.href) ?? "")
      location.href = url
      return
    }

    window.setTimeout(() => {
      chrome.runtime.sendMessage({ action: "get_tabstatus" }, (response) => {
        if (response) {
          chrome.runtime.sendMessage({ action: "close_current_tab" }, () => {})
        }
      })
    }, 3e3)
  })
})()
