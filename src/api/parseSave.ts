import { decompress } from "shrink-string"

import { Storage } from "@plasmohq/storage"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import { generateBlocks, generateTag } from "~utils/functions/notion"
import type { StoredDatabase } from "~utils/types"

// save new page to notion database
export const parseSave = async ({
  prompts,
  answers,
  title,
  url,
  database,
  generateHeadings
}: ParseSaveParams) => {
  try {
    const { propertiesIds, tagPropertyIndex, tagIndex, tags } = database

    const blocks: any[] = []
    for (let i = 0; i < prompts.length; i++) {
      const [decompressedAnswer, decompressedPrompt] = await Promise.all([
        decompress(answers[i]),
        decompress(prompts[i])
      ])
      const { answerBlocks, promptBlocks } = generateBlocks(
        decompressedPrompt,
        decompressedAnswer,
        generateHeadings
      )
      blocks.push(...promptBlocks, ...answerBlocks)
    }

    const chunks: any[][] = []
    const chunkSize = 95 // We define a chunk size of 95 blocks
    // Notion API has a limit of 100 blocks per request but we'd rather be conservative
    const chunksCount = Math.ceil(blocks.length / chunkSize)
    for (let i = 0; i < chunksCount; i++) {
      chunks.push(blocks.slice(i * chunkSize, (i + 1) * chunkSize))
    }

    const tag = generateTag(tags[tagPropertyIndex], tagIndex)

    return {
      chunks,
      database: {
        id: database.id,
        propertiesIds,
        tag,
        tags,
        tagPropertyIndex
      },
      url,
      title
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}

type ParseSaveParams = {
  prompts: string[]
  answers: string[]
  title: string
  database: StoredDatabase
  url: string
  generateHeadings: boolean
}
