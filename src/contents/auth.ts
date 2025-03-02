import type { PlasmoCSConfig, PlasmoContentScript } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: [
    "https://theo-lartigau.notion.site/ChatGPT-to-Notion-af29d9538dca4493a15bb4ed0fde7f91*"
  ]
}

export const auth = async () => {
  const code = new URLSearchParams(window.location.search).get("code")
  if (!code) return
  await sendToBackground({ name: "generateToken", body: { code } })
}

auth()
