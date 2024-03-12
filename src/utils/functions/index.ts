import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { markdownToBlocks } from "@tryfabric/martian"

import { Storage } from "@plasmohq/storage"

import nhm from "~config/html-markdown"
import type { ChatConfig, Conversation, Error, Message } from "~utils/types"

import { generateCallout, generateToggle } from "./notion"

export const HTMLtoBlocks = (html: string) => {
  const md = nhm.translate(html)

  return mdToBlocks(md, true)
}

export const mdToBlocks = (_md: string, fromHTML: boolean) => {
  const md = parseMarkdown(_md, fromHTML)
  // console.log("md", md)

  const _blocks = markdownToBlocks(md, { notionLimits: { truncate: true } })

  // console.log("_blocks", _blocks)

  let toggleChild = 0

  const blocks = _blocks.reduce((acc, block, i, arr) => {
    const blockType = block.type

    if (toggleChild > 0) {
      toggleChild--
      return acc
    }

    switch (blockType) {
      case "code":
        if (block.code.rich_text[0])
          block.code.rich_text[0].annotations = undefined
        acc.push(block)
        return acc

      case "quote":
        const content = getQuoteContent(block)

        const length = Number(content[0])
        const childs = isNaN(length)
          ? []
          : new Array(length).fill(0).map((_, idx) => arr[i + idx + 1])
        if (content.includes("TOGGLE")) {
          const toggle = generateToggle(i18n("notion_expandToSee"), childs)
          toggle.toggle.children.forEach((child) => {
            if (child.type === "code" && child.code.rich_text[0])
              child.code.rich_text[0].annotations = undefined
          })
          acc.push(toggle)
          toggleChild = length
        }
        if (content.includes("WORK")) {
          const callout = generateCallout(i18n("notion_gptWork"))
          acc.push(callout)
        }
        if (content.includes("IMAGE")) {
          const callout = generateCallout(i18n("notion_dalleExplainer"))
          const toggle =
            length > 0
              ? generateToggle(i18n("notion_dalleWork"), [callout, ...childs])
              : callout
          acc.push(toggle)
          toggleChild = length
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

const parseMarkdown = (md: string, fromHTML: boolean) => {
  return fromHTML
    ? md
        .replace(/^(Copy code)$/gm, "")
        .replace(/(^\n`)|(`\n$)/gm, "```\n")
        .replace(/(^\n(?<lang>.*)Copy code\n```)/gm, "\n```$<lang>")
        .replace(/\]\(\/mnt/gm, "](https://chat.openai.com/mnt")
        .replace(/\|\n(?=[^\s\|])/gm, "|\n\n") // edge cases making me crazy
        .replace(
          // Custom tags works with minimal changes to the codebase so I'm definitely keeping it that way
          /(%%CHATGPT\\_TO\\_NOTION\\_SPLIT(?<len>.*)%%)/gm,
          "> $<len>WORK"
        )
        .replace(
          /(%%CHATGPT\\_TO\\_NOTION\\_WORK(?<len>.*)%%)/gm,
          "> $<len>TOGGLE"
        )
        .replace(
          /(%%CHATGPT\\_TO\\_NOTION\\_IMAGE(?<len>.*)%%)/gm,
          "> $<len>IMAGE\n"
        )
    : md
        .replace(/\|\n(?=[^\s\|])/gm, "|\n\n")
        .replace(/\]\(sandbox:\/mnt/gm, "](https://chat.openai.com/mnt")
        .replace(/(%%CHATGPT_TO_NOTION_SPLIT(?<len>.*)%%)/gm, "> $<len>WORK")
        .replace(/(%%CHATGPT_TO_NOTION_WORK(?<len>.*)%%)/gm, "> $<len>TOGGLE")
        .replace(/(%%CHATGPT_TO_NOTION_IMAGE(?<len>.*)%%)/gm, "> $<len>IMAGE\n")
        .replace(
          /((\\\[)|(\\\())(?<katex>.*)((\\\])|(\\\)))(?!.*\/g?m?)/gm,
          "$$ $<katex> $$"
        )
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

export const convertHeaders = (raw: { name: string; value?: string }[]) => {
  return raw.reduce(
    (acc, header) => ({ ...acc, [header.name]: header.value }),
    {} as any
  )
}

export const parseConversation = (rawConv: Conversation) => {
  const { conversation_id: id, title, mapping } = rawConv

  // TODO: fix the bangs (!) that are all over the place
  const messages = Object.values(mapping)
    .filter(
      (item) =>
        item.message != undefined && item.message.author?.role != "system"
    )
    .sort((a, b) => a.message!.create_time - b.message!.create_time)

  const rawPrompts = messages.filter(
    (item) => item.message!.author?.role == "user"
  )

  const prompts = rawPrompts.map(
    (item) =>
      item.message!.content.text ??
      (item.message!.content.parts?.join("\n") as string)
  )
  const answers = rawPrompts.map((item) => {
    const answer = []
    flattenMessage(item, mapping, answer)
    return answer.slice(1).join("\n\n") // Flattening adds the prompt as the first element so we slice
  })

  const url = "https://chat.openai.com/c/" + id

  return { url, title, prompts, answers }
}

export const flattenMessage = (
  msg: Message,
  mapping: Conversation["mapping"],
  flattenedMessage: string[]
) => {
  const message = msg.message
  if (!message) return

  switch (message.content.content_type) {
    case "text":
      flattenedMessage.push(
        message.content.text ??
          message.content.parts?.join("\n") ??
          "[missing text]"
      )
      break

    case "code":
      let text = message.content.text
      text = "%%CHATGPT_TO_NOTION_WORK2%%\n```python\n" + text + "\n```"
      flattenedMessage.push(text)
      break

    case "multimodal_text":
      if (message.author?.name != "dalle.text2im") return
      flattenedMessage.push(
        `%%CHATGPT_TO_NOTION_IMAGE${message.content.parts?.length}%%\n`
      )
      message.content.parts?.forEach((part) => {
        if (part.content_type != "image_asset_pointer") return
        const text = `[url: ${part.asset_pointer}], prompt: ${part.metadata.dalle.prompt}\n`
        flattenedMessage.push(text)
      })
      break

    case "execution_output":
      const output =
        message.content.text ??
        message.content.parts?.join("\n") ??
        "[missing text]"
      flattenedMessage.push("```" + output + "```")
      break
  }

  if (msg.children && !message.end_turn) {
    msg.children.forEach((childId) => {
      const child = mapping[childId]
      if (child.message?.author?.role == "user") return
      flattenMessage(child, mapping, flattenedMessage)
    })
  }
}
