import { decompress } from "shrink-string"

import { Storage } from "@plasmohq/storage"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import { generateBlocks, generateTag } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

// save new page to notion database
export const saveAnswer = async ({
  prompt,
  answer,
  title,
  url,
  database,
  generateHeadings
}: SaveAnswerParams) => {
  try {
    const notion = await getNotion()
    const { propertiesIds, tagPropertyIndex, tagIndex, tags } = database
    const decompressedAnswer = await decompress(answer)
    const decompressedPrompt = await decompress(prompt)
    const { answerBlocks, promptBlocks } = generateBlocks(
      decompressedPrompt,
      decompressedAnswer,
      generateHeadings
    )

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
      const block_id = page.id
      const response = await notion.blocks.children.append({
        block_id,
        children: [...promptBlocks, ...answerBlocks]
      })
      return response
    }

    // @ts-ignore
    const response = await notion.pages.create({
      parent: {
        database_id: database.id
      },
      icon: {
        type: "external",
        external: {
          url: "https://openai.com/content/images/2022/05/openai-avatar.png"
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
            ,
            ...promptBlocks,
            ...answerBlocks
          ]
        : [...promptBlocks, ...answerBlocks]
    })
    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

type SaveAnswerParams = {
  prompt: string
  answer: string
  title: string
  database: StoredDatabase
  url: string
  generateHeadings: boolean
}
