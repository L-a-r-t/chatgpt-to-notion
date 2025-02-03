import { Storage } from "@plasmohq/storage"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { generateToken } from "~api/generateToken"
import { getDatabase } from "~api/getDatabase"
import { searchNotion } from "~api/search"
import { STORAGE_KEYS } from "~utils/consts"

import {
  authenticate,
  fetchHistory,
  refreshContentScripts,
  refreshDatabases,
  refreshIcons,
  save,
  saveHistory
} from "./functions"

const storage = new Storage()
const session = new Storage({
  area: "session",
  secretKeyList: ["token", "cacheHeaders"]
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://www.maxai.me/partners/installed/chatgpt-to-notion/"
    })
    storage.set(STORAGE_KEYS.ecoModeActive, false)
    storage.set(STORAGE_KEYS.ecoModePopup, false)
  }
  if (details.reason === "update") {
    // chrome.tabs.create({
    //   url: `chrome-extension://${chrome.runtime.id}/tabs/update.html`
    // })
    storage.get(STORAGE_KEYS.isPremium).then((isPremium) => {
      if (!isPremium) {
        chrome.tabs.create({
          url: "https://www.extensions-hub.com/partners/updated?name=ChatGPT-to-Notion"
        })
      }
    })
  }

  refreshContentScripts()
})

chrome.runtime.setUninstallURL(
  "https://www.extensions-hub.com/partners/uninstalled?name=ChatGPT-to-Notion"
)

const main = async () => {
  const authenticated = await authenticate()
  if (!authenticated) return
  await refreshDatabases()
  refreshIcons()
  const storage = new Storage()
  storage.set(STORAGE_KEYS.historyLength, 0)
  storage.set(STORAGE_KEYS.historySaveProgress, -1)
  const ecoModeActive = await storage.get(STORAGE_KEYS.ecoModeActive)
  const ecoModePopup = await storage.get(STORAGE_KEYS.ecoModePopup)
  // we need it to be set to false, not undefined
  if (!ecoModeActive) storage.set(STORAGE_KEYS.ecoModeActive, false)
  if (!ecoModePopup) storage.set(STORAGE_KEYS.ecoModePopup, false)
}

main()

// let cacheHeaders: chrome.webRequest.HttpHeader[]

const trackedURLs = ["https://chatgpt.com/*", "https://chat.deepseek.com/*"]

const deepseekUrls = [
  "https://chat.deepseek.com/api/v0/chat/history_messages"
  // "ttps://chat.deepseek.com/api/v0/chat_session/fetch_page?count=100"
]

chrome.webRequest.onSendHeaders.addListener(
  (res) => {
    if (
      res.method == "POST" &&
      res.url == "https://chatgpt.com/backend-api/conversation"
    ) {
      storage.set(STORAGE_KEYS.generatingAnswer, true)
      return
    }

    if (
      // cacheHeaders ||
      !res.requestHeaders ||
      !res.requestHeaders.some((h) => h.name.toLowerCase() === "authorization")
    )
      return

    if (res.url.includes("chatgpt.com")) {
      session.set(STORAGE_KEYS.cacheHeaders, res.requestHeaders)
      storage.set(STORAGE_KEYS.hasCacheHeaders, true)
      return
    }

    if (deepseekUrls.some((url) => res.url.includes(url))) {
      // console.log({ url: res.url, headers: res.requestHeaders })
      // console.log("Setting cache headers")

      session.set(STORAGE_KEYS.cacheHeaders, res.requestHeaders)
      storage.set(STORAGE_KEYS.hasCacheHeaders, true)
      return
    }

    // cacheHeaders = res.requestHeaders
  },
  { urls: trackedURLs, types: ["xmlhttprequest"] },
  ["requestHeaders", "extraHeaders"]
)

chrome.webRequest.onCompleted.addListener(
  (res) => {
    if (
      res.method != "POST" ||
      res.url != "https://chatgpt.com/backend-api/conversation"
    )
      return
    storage.set(STORAGE_KEYS.generatingAnswer, false)
  },
  { urls: ["https://chatgpt.com/*"], types: ["xmlhttprequest"] }
)

export default {}
