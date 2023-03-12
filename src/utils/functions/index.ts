import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { markdownToBlocks } from "@tryfabric/martian"

import nhm from "~config/html-markdown"

export const HTMLtoMarkdown = (html: string) => {
  return nhm
    .translate(html)
    .replace(/^(Copy code)$/gm, "")
    .replace(/(^\n`)|(`\n$)/gm, "```\n")
    .replace(/(^\n(?<lang>.*)Copy code\n```)/gm, "\n```$<lang>")
}

export const HTMLtoBlocks = (html: string) => {
  const md = HTMLtoMarkdown(html)
  const blocks = markdownToBlocks(md)
  blocks.reduce((acc, block) => {
    if (block.type !== "code") {
      acc.push(block)
    } else {
      block.code.rich_text[0].annotations = undefined
      acc.push(block)
    }
    return acc
  }, [] as BlockObjectRequest[])
  return blocks as any[]
}

export const i18n = (key: string) => {
  return chrome.i18n.getMessage(key)
}
