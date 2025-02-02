import { URL } from "url"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { STORAGE_KEYS } from "~utils/consts"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const storage = new Storage()

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const tab = tabs[0]

    if (tab.url) {
      const tabURL = new URL(tab.url)

      if (tabURL.hostname.includes("chatgpt.com")) {
        await storage.set(STORAGE_KEYS.model, "chatgpt")
      }
      if (tabURL.hostname.includes("chat.deepseek.com")) {
        await storage.set(STORAGE_KEYS.model, "deepseek")
      }
    }

    res.send({ tabId: tab.id, tabUrl: tab.url })
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
