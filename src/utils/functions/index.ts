import { markdownToBlocks } from "@tryfabric/martian"

import nhm from "~config/html-markdown"

export const HTMLtoMarkdown = (html: string) => {
  return nhm
    .translate(html)
    .replace(/^(Copy code)$/gm, "")
    .replace(/(^\n`)|(`\n$)/gm, "```\n")
}

export const HTMLtoBlocks = (html: string) => {
  return markdownToBlocks(HTMLtoMarkdown(html)) as any[]
}

export const i18n = (key: string) => {
  return chrome.i18n.getMessage(key)
}
