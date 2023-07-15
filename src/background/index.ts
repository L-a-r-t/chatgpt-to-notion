import { Storage } from "@plasmohq/storage"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { generateToken } from "~api/generateToken"
import { getDatabase } from "~api/getDatabase"
import { saveChat } from "~api/saveChat"
import { searchNotion } from "~api/search"
import type { AutosaveStatus } from "~utils/types"

import {
  authenticate,
  refreshContentScripts,
  refreshDatabases,
  refreshIcons,
  saveFromContextMenu
} from "./functions"

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
      const storage = new Storage()
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
      const session = new Storage({
        area: "session",
        secretKeyList: ["token"]
      })
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
    default:
      return true
  }
  return true
})

chrome.runtime.onInstalled.addListener(() => {
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
}

main()

export default {}
