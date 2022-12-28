import { decompress } from "shrink-string"

import getNotion from "~config/notion"
import Notion from "~config/notion"
import { generateBlocks } from "~utils/functions/notion"

// save new page to notion database
export const saveAnswer = async ({
  prompt,
  answer,
  title,
  url,
  database_id
}: SaveAnswerParams) => {
  try {
    const notion = await getNotion()
    const decompressedAnswer = await decompress(answer)
    const decompressedPrompt = await decompress(prompt)
    const { answerBlocks, promptBlocks } = generateBlocks(
      decompressedPrompt,
      decompressedAnswer
    )

    const searchRes = await notion.databases.query({
      database_id,
      filter: {
        property: "Name",
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

    const response = await notion.pages.create({
      parent: {
        database_id: database_id
      },
      icon: {
        type: "external",
        external: {
          url: "https://openai.com/content/images/2022/05/openai-avatar.png"
        }
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        URL: {
          url
        }
      },
      children: [
        {
          object: "block",
          type: "table_of_contents",
          table_of_contents: {}
        },
        ...promptBlocks,
        ...answerBlocks
      ]
    })
    return response
  } catch (err) {
    console.error(err)
  }
}

type SaveAnswerParams = {
  prompt: string
  answer: string
  title: string
  database_id: string
  url: string
}
