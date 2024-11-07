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

// API calls that can be made from content scripts transit trough the background script
// This is done to prevent CORS errors
// Functions here aren't decoupled from the background script because of odd behavior with sendResponse
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const body = message.body
  switch (message.type) {
    case "chatgpt-to-notion_search":
      searchNotion(body.query)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_checkSaveConflict":
      checkSaveConflict(body)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_save":
      session.get<any>(STORAGE_KEYS.cacheHeaders).then((cacheHeaders) => {
        save(
          body.convId,
          cacheHeaders,
          body.turn,
          body.saveBehavior,
          body.conflictingPageId,
          body.autoSave
        )
          .then((res) => {
            sendResponse(res)
          })
          .catch((err) => {
            sendResponse({
              err
            })
          })
      })
      break
    case "chatgpt-to-notion_generateToken":
      // using two means of checking if user is logged in just to be sure
      session.get(STORAGE_KEYS.token).then((token) => {
        if (token) return
        generateToken(body.code)
          .then((res) => {
            console.log(res)
            sendResponse(res)
          })
          .catch((err) => {
            console.error(err)
            sendResponse({ err })
          })
      })
      break
    case "chatgpt-to-notion_getDB":
      getDatabase(body.id)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_saveHistory":
      session.get<any>(STORAGE_KEYS.cacheHeaders).then((cacheHeaders) => {
        fetchHistory(cacheHeaders).then((history) => {
          saveHistory(history, cacheHeaders)
        })
      })
      break
    case "chatgpt-to-notion_getCurrentTab":
      chrome.tabs
        .query({
          active: true,
          currentWindow: true
        })
        .then((tabs) => {
          const tab = tabs[0]
          sendResponse({ tabId: tab.id, tabUrl: tab.url })
        })
      break
    case "chatgpt-to-notion_bg-fetchFullChat":
      chrome.tabs
        .sendMessage(body.tabId, "chatgpt-to-notion_fetchFullChat")
        .then((res) => sendResponse(res))
    case "chatgpt-to-notion_open-eco-about-page":
      chrome.tabs.create(
        {
          url: "https://impacthero.co/ecomode/?extension_name=chatgpt_to_notion",
          active: true
        },
        (createdPermanentTab) => {
          chrome.storage.local.set({
            openPermanentTab: true
          })
        }
      )

    default:
      return true
  }
  return true
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

let cacheHeaders: chrome.webRequest.HttpHeader[]

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
      cacheHeaders ||
      !res.requestHeaders ||
      !res.requestHeaders.some((h) => h.name === "Authorization")
    )
      return

    cacheHeaders = res.requestHeaders
    session.set(STORAGE_KEYS.cacheHeaders, cacheHeaders)
    storage.set(STORAGE_KEYS.hasCacheHeaders, true)
  },
  { urls: ["https://chatgpt.com/*"], types: ["xmlhttprequest"] },
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
