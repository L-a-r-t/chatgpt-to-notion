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
          body.conflictingPageId
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
          const tabId = tabs[0].id!
          sendResponse(tabId)
        })
      break
    case "chatgpt-to-notion_bg-fetchFullChat":
      chrome.tabs
        .sendMessage(body.tabId, "chatgpt-to-notion_fetchFullChat")
        .then((res) => sendResponse(res))

    default:
      return true
  }
  return true
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://www.maxai.me/partners/installed/chatgpt-to-notion"
    })
  }
  if (details.reason === "update") {
    chrome.tabs.create({
      url: "https://www.extensions-hub.com/chatgpt-to-notion/updated/"
    })
  }

  refreshContentScripts()
})

const main = async () => {
  const authenticated = await authenticate()
  if (!authenticated) return
  await refreshDatabases()
  refreshIcons()
  const storage = new Storage()
  storage.set(STORAGE_KEYS.historyLength, 0)
  storage.set(STORAGE_KEYS.historySaveProgress, -1)
  storage.set(STORAGE_KEYS.hasCacheHeaders, false)
}

main()

let cacheHeaders: chrome.webRequest.HttpHeader[]

chrome.webRequest.onSendHeaders.addListener(
  (res) => {
    if (
      res.method == "POST" &&
      res.url == "https://chat.openai.com/backend-api/conversation"
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
  { urls: ["https://chat.openai.com/*"], types: ["xmlhttprequest"] },
  ["requestHeaders", "extraHeaders"]
)

chrome.webRequest.onCompleted.addListener(
  (res) => {
    if (
      res.method != "POST" ||
      res.url != "https://chat.openai.com/backend-api/conversation"
    )
      return
    storage.set(STORAGE_KEYS.generatingAnswer, false)
  },
  { urls: ["https://chat.openai.com/*"], types: ["xmlhttprequest"] }
)

export default {}
