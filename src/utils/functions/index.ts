import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { markdownToBlocks } from "@tryfabric/martian"

import { Storage } from "@plasmohq/storage"

import nhm from "~config/html-markdown"
import type { ChatConfig, Error } from "~utils/types"

import { generateCallout, generateToggle } from "./notion"

export const HTMLtoMarkdown = (html: string) => {
  return nhm
    .translate(html)
    .replace(/^(Copy code)$/gm, "")
    .replace(/(^\n`)|(`\n$)/gm, "```\n")
    .replace(/(^\n(?<lang>.*)Copy code\n```)/gm, "\n```$<lang>")
    .replace(/\|\n(?=[^\s\|])/gm, "|\n\n") // edge cases making me crazy
    .replace(/\]\(\/mnt/gm, "](https://chat.openai.com/mnt")
    .replace(
      // Custom tags works with minimal changes to the codebase so I'm definitely keeping it that way
      /(%%CHATGPT\\_TO\\_NOTION\\_SPLIT%%)/gm,
      "> WORK"
    )
    .replace(/(%%CHATGPT\\_TO\\_NOTION\\_WORK%%)/gm, "> TOGGLE")
}

export const HTMLtoBlocks = (html: string) => {
  const md = HTMLtoMarkdown(html)
  // console.log("md", md)
  const _blocks = markdownToBlocks(md)

  // console.log("_blocks", _blocks)

  const blocks = _blocks.reduce((acc, block, i, arr) => {
    const blockType = block.type

    switch (blockType) {
      case "code":
        if (isToggle(arr[i - 1])) return acc

        if (block.code.rich_text[0])
          block.code.rich_text[0].annotations = undefined
        acc.push(block)
        return acc

      case "quote":
        const content = getQuoteContent(block)

        if (content.includes("TOGGLE")) {
          const toggle = generateToggle("Expand to see ChatGPT's work", [
            arr[i + 1]
          ])
          toggle.toggle.children[0].code.rich_text[0].annotations = undefined
          acc.push(toggle)
        }
        if (content.includes("WORK")) {
          const callout = generateCallout(
            "ChatGPT work, expand it before saving for it to show here"
          )
          acc.push(callout)
        }

        return acc

      default:
        acc.push(block)
        return acc
    }
  }, [] as BlockObjectRequest[])
  // console.log("blocks", blocks)
  return blocks as any[]
}

const getQuoteContent = (quoteBlock: any) => {
  if (quoteBlock.type !== "quote") return ""
  const child = quoteBlock.quote.children?.[0]
  const content: string = child.paragraph.rich_text[0].text.content
  return content
}

const isToggle = (block: any) => {
  return block.type === "quote" && getQuoteContent(block).includes("TOGGLE")
}

export const i18n = (key: string) => {
  return chrome.i18n.getMessage(key)
}

export const getChatConfig = async (chatID: string) => {
  const config = await new Storage().get<ChatConfig>(chatID)
  return config
}

export const updateChatConfig = async (
  chatID: string,
  params: Partial<ChatConfig>
) => {
  const storage = new Storage()
  const config = (await storage.get<ChatConfig>(chatID)) as ChatConfig
  const newConfig = { ...(config ?? {}), ...params }
  await storage.set(chatID, newConfig)
  return newConfig
}

export const getConsiseErrMessage = (error: Error) => {
  switch (error?.status) {
    case 401:
      return i18n("save_unauthorized")
    case 404:
      return i18n("save_notFound")
    case 500:
      return i18n("save_serverError")
    default:
      return i18n("save_error")
  }
}
