import type {
  AppendBlockChildrenResponse,
  CreatePageResponse,
  PageObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

import { Storage } from "@plasmohq/storage"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import { generateBlocks, generateTag } from "~utils/functions/notion"
import type { SaveBehavior, StoredDatabase } from "~utils/types"

import type { parseSave } from "./parseSave"

// save new page to notion database
export const saveChat = async ({
  title,
  url,
  database,
  chunks,
  generateHeadings,
  conflictingPageId,
  saveBehavior
}: SaveChatParams) => {
  try {
    const notion = await getNotion()
    const { propertiesIds, tags, tagPropertyIndex, tag } = database

    if (conflictingPageId) {
      switch (saveBehavior) {
        case "override":
          await notion.pages.update({
            page_id: conflictingPageId,
            archived: true
          })
          break
        case "ignore":
          title = `${title} (bis)`
          break
      }
    }

    let response: CreatePageResponse | AppendBlockChildrenResponse
    let block_id: string

    if (conflictingPageId && saveBehavior === "append") {
      response = await notion.blocks.children.append({
        block_id: conflictingPageId,
        children: chunks[0]
      })
      block_id = conflictingPageId
    } else {
      // @ts-ignore
      response = await notion.pages.create({
        parent: {
          database_id: database.id
        },
        icon: {
          type: "external",
          external: {
            url: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"
          }
        },
        properties: {
          [propertiesIds.title]: {
            title: [
              {
                text: {
                  content: title
                }
              }
            ]
          },
          [propertiesIds.url]: {
            url
          },
          [tags[tagPropertyIndex].id]: tag
        },
        children: generateHeadings
          ? [table_of_contents, ...chunks[0]]
          : [...chunks[0]]
      })
      block_id = response.id
    }
    for (let i = 1; i < chunks.length; i++) {
      await notion.blocks.children.append({
        block_id,
        children: chunks[i]
      })
    }
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

export type SaveChatParams = Awaited<ReturnType<typeof parseSave>> & {
  generateHeadings: boolean
  conflictingPageId?: string
  saveBehavior: SaveBehavior
}

const table_of_contents = {
  object: "block",
  type: "toggle",
  toggle: {
    rich_text: [
      {
        type: "text",
        text: {
          content: i18n("notion_tableofcontents")
        }
      }
    ],
    children: [
      {
        object: "block",
        type: "table_of_contents",
        table_of_contents: {}
      }
    ]
  }
}
