import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { markdownToBlocks } from "@tryfabric/martian"

import { Storage } from "@plasmohq/storage"

import nhm from "~config/html-markdown"
import type { ChatConfig, Error } from "~utils/types"

import { generateCallout, generateToggle } from "./notion"

export const HTMLtoBlocks = (html: string) => {
  const md = nhm.translate(html)

  return mdToBlocks(md, true)
}

export const mdToBlocks = (_md: string, fromHTML?: boolean) => {
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
        if (content.includes("CANVAS")) {
          const callout = generateCallout(
            i18n("notion_canvasExplainer") ||
              "The latest version of the canvas at the time of save can be found below."
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

const parseMarkdown = (md: string, fromHTML?: boolean) => {
  return fromHTML
    ? md
        .replace(/^(Copy code)$/gm, "")
        .replace(/(^\n`)|(`\n$)/gm, "```\n")
        .replace(/(^\n(?<lang>.*)Copy code\n```)/gm, "\n```$<lang>")
        .replace(/(^\n```jsx)/gm, "\n```javascript")
        .replace(/(^\n```tsx)/gm, "\n```typescript")
        .replace(/\]\(\/mnt/gm, "](https://chatgpt.com/mnt")
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
        .replace(/(^\n```jsx)/gm, "\n```javascript")
        .replace(/(^\n```tsx)/gm, "\n```typescript")
        .replace(/\]\(sandbox:\/mnt/gm, "](https://chatgpt.com/mnt")
        .replace(/(%%CHATGPT_TO_NOTION_SPLIT(?<len>.*)%%)/gm, "> $<len>WORK")
        .replace(/(%%CHATGPT_TO_NOTION_WORK(?<len>.*)%%)/gm, "> $<len>TOGGLE")
        .replace(/(%%CHATGPT_TO_NOTION_IMAGE(?<len>.*)%%)/gm, "> $<len>IMAGE\n")
        .replace(/(%%CHATGPT_TO_NOTION_CANVAS(?<len>.*)%%)/gm, "> CANVAS")
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
