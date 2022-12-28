import getNotion from "~config/notion"
import { generateBlocks } from "~utils/functions/notion"

// save new page to notion database
export const saveChat = async ({
  prompts,
  answers,
  title,
  url,
  database_id
}: SaveChatParams) => {
  try {
    const notion = await getNotion()
    const blocks = []
    for (let i = 0; i < prompts.length; i++) {
      const { answerBlocks, promptBlocks } = generateBlocks(
        prompts[i],
        answers[i]
      )
      blocks.push(...promptBlocks, ...answerBlocks)
    }

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
      const page_id = page.id
      await notion.pages.update({
        page_id,
        archived: true
      })
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
  database_id: string
  url: string
}
