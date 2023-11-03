import { Storage } from "@plasmohq/storage"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { generateToken } from "~api/generateToken"
import { getDatabase } from "~api/getDatabase"
import { saveChat } from "~api/saveChat"
import { searchNotion } from "~api/search"
import type { AutosaveStatus } from "~utils/types"

import {
  authenticate,
  fetchHistory,
  refreshContentScripts,
  refreshDatabases,
  refreshIcons,
  saveFromContextMenu,
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
  switch (message.type) {
    case "chatgpt-to-notion_search":
      searchNotion(message.body.query)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_checkSaveConflict":
      checkSaveConflict(message.body)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_saveChat":
      saveChat(message.body)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_autoSave":
      saveChat(message.body)
        .then((res) => {
          sendResponse(res)
          storage.set("autosaveStatus", "saved" as AutosaveStatus)
        })
        .catch((err) => {
          storage.set("autosaveStatus", "error" as AutosaveStatus)
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_generateToken":
      // using two means of checking if user is logged in just to be sure
      session.get("token").then((token) => {
        if (token) return
        generateToken(message.body.code)
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
      getDatabase(message.body.id)
        .then((res) => {
          sendResponse(res)
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ err })
        })
      break
    case "chatgpt-to-notion_saveHistory":
      session.get<any>("cacheHeaders").then((cacheHeaders) => {
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
        .sendMessage(message.body.tabId, "chatgpt-to-notion_fetchFullChat")
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

  refreshContentScripts()

  chrome.contextMenus.create({
    id: "append",
    title: "Save chat to Notion (append if conflict)",
    targetUrlPatterns: ["https://chat.openai.com/*"]
  })
  chrome.contextMenus.create({
    id: "override",
    title: "Save chat to Notion (override if conflict)",
    targetUrlPatterns: ["https://chat.openai.com/*"]
  })
})

chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  saveFromContextMenu(menuItemId as "append" | "override")
})

const main = async () => {
  const authenticated = await authenticate()
  if (!authenticated) return
  await refreshDatabases()
  refreshIcons()
  const storage = new Storage()
  storage.set("historyLength", 0)
  storage.set("historySaveProgress", -1)
}

main()

let cacheHeaders: chrome.webRequest.HttpHeader[]

chrome.webRequest.onSendHeaders.addListener(
  (res) => {
    if (
      res.method == "POST" &&
      res.url == "https://chat.openai.com/backend-api/conversation"
    ) {
      storage.set("generatingAnswer", true)
      return
    }

    if (
      cacheHeaders ||
      !res.requestHeaders ||
      !res.requestHeaders.some((h) => h.name === "Authorization")
    )
      return

    cacheHeaders = res.requestHeaders
    session.set("cacheHeaders", cacheHeaders)
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
    storage.set("generatingAnswer", false)
  },
  { urls: ["https://chat.openai.com/*"], types: ["xmlhttprequest"] }
)

export default {}
