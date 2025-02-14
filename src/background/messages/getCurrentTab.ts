import { URL } from "url"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { STORAGE_KEYS } from "~utils/consts"
import type { SupportedModels } from "~utils/types"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const storage = new Storage()

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const tab = tabs[0]

    let model: SupportedModels | null = null

    if (tab.url?.includes("chatgpt.com")) {
      model = "chatgpt"
      await storage.set(STORAGE_KEYS.model, "chatgpt")
    }
    if (tab.url?.includes("chat.deepseek.com")) {
      model = "deepseek"
      await storage.set(STORAGE_KEYS.model, "deepseek")
    }
    if (tab.url?.includes("chat.mistral.ai")) {
      model = "mistral"
      await storage.set(STORAGE_KEYS.model, "mistral")
    }
    if (tab.url?.includes("claude.ai")) {
      model = "claude"
      await storage.set(STORAGE_KEYS.model, "claude")
    }

    res.send({ tabId: tab.id, tabUrl: tab.url, model })
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
