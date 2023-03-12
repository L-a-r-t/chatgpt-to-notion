import { Storage } from "@plasmohq/storage"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import { generateBlocks, generateTag } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

// save new page to notion database
export const saveChat = async ({
  prompts,
  answers,
  title,
  url,
  database,
  generateHeadings
}: SaveChatParams) => {
  try {
    const notion = await getNotion()
    const { propertiesIds, tags, tagIndex, tagPropertyIndex } = database
    const blocks: any[] = []
    for (let i = 0; i < prompts.length; i++) {
      const { answerBlocks, promptBlocks } = generateBlocks(
        prompts[i],
        answers[i],
        generateHeadings
      )
      blocks.push(...promptBlocks, ...answerBlocks)
    }

    const chunks: any[][] = []
    const chunkSize = 80 // We define a chunk size of 80 blocks
    // Notion API has a limit of 100 blocks per request but we'd rather be conservative
    const chunksCount = Math.ceil(blocks.length / chunkSize)
    for (let i = 0; i < chunksCount; i++) {
      chunks.push(blocks.slice(i * chunkSize, (i + 1) * chunkSize))
    }

    const tag = generateTag(tags[tagPropertyIndex], tagIndex)

    const searchRes = await notion.databases.query({
      database_id: database.id,
      filter: {
        property: propertiesIds.title,
        title: {
          equals: title
        }
      }
    })

    if (searchRes.results.length > 0) {
      const page = searchRes.results[0]
      const page_id = page.id
      await notion.pages.update({
        page_id,
        archived: true
      })
    }

    // @ts-ignore
    const response = await notion.pages.create({
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
        ? [
            {
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
            },
            ...chunks[0]
          ]
        : [...chunks[0]]
    })
    for (let i = 1; i < chunks.length; i++) {
      await notion.blocks.children.append({
        block_id: response.id,
        children: chunks[i]
      })
    }
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

type SaveChatParams = {
  prompts: string[]
  answers: string[]
  title: string
  database: StoredDatabase
  url: string
  generateHeadings: boolean
}
