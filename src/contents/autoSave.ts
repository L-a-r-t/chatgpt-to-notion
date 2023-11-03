import type { PlasmoContentScript } from "plasmo"
import { compress } from "shrink-string"

import { Storage } from "@plasmohq/storage"

import { parseSave } from "~api/parseSave"
import { getChatConfig, updateChatConfig } from "~utils/functions"
import type { AutosaveStatus, ChatConfig } from "~utils/types"

import { fetchFullChat } from "./fetchFullPage"

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/*"]
}

const storage = new Storage()

storage.watch({
  generatingAnswer: async ({ newValue, oldValue }) => {
    const chatID = await storage.get("chatID")

    if (newValue == true && oldValue == false) {
      updateChatConfig(chatID, { lastSaveStatus: "generating" })
      storage.set("autosaveStatus", "generating" as AutosaveStatus)
    } else if (newValue == false && oldValue == true) {
      try {
        const [isPremium, activeTrial] = await Promise.all([
          storage.get("isPremium"),
          storage.get("activeTrial")
        ])
        if (!(isPremium || activeTrial)) return

        const config = await getChatConfig(chatID)
        if (!config || !config.enabled) return

        storage.set("autosaveStatus", "saving" as AutosaveStatus)

        let { prompts, answers, url, title } = await fetchFullChat()

        answers = answers.slice(-1)
        prompts = prompts.slice(-1)

        const database = config.database

        if (!database) {
          throw new Error("No database linked to this chat")
        }

        const generateHeadings = await storage.get<boolean>("generateHeadings")

        const { conflictingPageId } = await chrome.runtime.sendMessage({
          type: "chatgpt-to-notion_checkSaveConflict",
          body: {
            title,
            database
          }
        })

        const req = {
          title,
          prompts: await Promise.all(prompts.map((p) => compress(p!))),
          answers: await Promise.all(answers.map((a) => compress(a))),
          url,
          database,
          generateHeadings
        }
        const parsedReq = {
          ...(await parseSave(req)),
          saveBehavior: "append",
          conflictingPageId
        }
        const res = await chrome.runtime.sendMessage({
          type: "chatgpt-to-notion_autoSave",
          body: parsedReq
        })

        updateChatConfig(chatID, {
          lastSaveStatus: res.err ? "error" : "success",
          lastError: res.err
            ? {
                message: res.err.message ?? null,
                code: res.err.code ?? res.err.status ?? null
              }
            : null
        })
      } catch (err) {
        console.error(err)
        storage.set("autosaveStatus", "error" as AutosaveStatus)
        updateChatConfig(chatID, {
          lastSaveStatus: "error",
          lastError: {
            message: err.message ?? null,
            code: err.code ?? err.status ?? null
          }
        })
      }
    }
  }
})

const onload = async () => {
  let chatID = window.location.href.split("/c/").pop()
  if (chatID?.length != 36) chatID = undefined
  await storage.set("chatID", chatID ?? null)
}

// https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
let oldHref = document.location.href
window.onload = () => {
  onload()
  new MutationObserver((mutations) =>
    mutations.forEach(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href
        onload()
      }
    })
  ).observe(document.querySelector("body")!, { childList: true, subtree: true })
}
