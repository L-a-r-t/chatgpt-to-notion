import getNotion from "~config/notion"
import { generateBlocks, generateTag } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

// save new page to notion database
export const saveChat = async ({
  prompts,
  answers,
  title,
  url,
  database
}: SaveChatParams) => {
  try {
    const notion = await getNotion()
    const { propertiesIds, tags, tagIndex, tagPropertyIndex } = database
    const blocks: any[] = []
    for (let i = 0; i < prompts.length; i++) {
      const { answerBlocks, promptBlocks } = generateBlocks(
        prompts[i],
        answers[i]
      )
      blocks.push(...promptBlocks, ...answerBlocks)
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
      children: [
        {
          object: "block",
          type: "table_of_contents",
          table_of_contents: {}
        },
        ...blocks
      ]
    })
    return response
  } catch (err) {
    console.error(err)
  }
}

type SaveChatParams = {
  prompts: string[]
  answers: string[]
  title: string
  database: StoredDatabase
  url: string
}
