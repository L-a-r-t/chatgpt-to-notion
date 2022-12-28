import type { PlasmoContentScript } from "plasmo"

import { Storage } from "@plasmohq/storage"

export const config: PlasmoContentScript = {
  matches: ["https://github.com/L-a-r-t/chatgpt-to-notion*"]
}

export const auth = async () => {
  const code = new URLSearchParams(window.location.search).get("code")
  if (!code) return
  await chrome.runtime.sendMessage({
    type: "generateToken",
    body: { code }
  })
}

auth()
