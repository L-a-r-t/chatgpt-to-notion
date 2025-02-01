import type {
  AppendBlockChildrenResponse,
  CreatePageResponse
} from "@notionhq/client/build/src/api-endpoints"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import type { SaveBehavior, SupportedModels } from "~utils/types"

import type { parseSave } from "./parseSave"

// save new page to notion database
export const saveChat = async (
  params: SaveChatParams,
  callback: (saved: number) => void = () => {}
) => {
  try {
    const notion = await getNotion()
    let {
      model,
      title,
      url,
      database,
      chunks,
      generateHeadings,
      conflictingPageId,
      saveBehavior
    } = params
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
        properties: tag
          ? {
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
            }
          : {
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
              }
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
    console.log("Error occured when saving the following:", params)
    console.error(err)
    throw err
  }
}

export type SaveChatParams = Awaited<ReturnType<typeof parseSave>> & {
  model: SupportedModels
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
