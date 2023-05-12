import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { markdownToBlocks } from "@tryfabric/martian"

import { Storage } from "@plasmohq/storage"

import nhm from "~config/html-markdown"
import type { ChatConfig, Error } from "~utils/types"

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
