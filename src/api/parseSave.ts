import { decompress } from "shrink-string"

import { Storage } from "@plasmohq/storage"

import getNotion from "~config/notion"
import { i18n } from "~utils/functions"
import {
  generateBlocks,
  generateCanvasBlocks,
  generateTag
} from "~utils/functions/notion"
import type { ConversationTextdocs, StoredDatabase } from "~utils/types"

// save new page to notion database
export const parseSave = async (
  params: ParseSaveParams,
  { compressed, isMarkdown }: { compressed: boolean; isMarkdown: boolean } = {
    compressed: true,
    isMarkdown: false
  }
) => {
  try {
    let { prompts, answers, textDocs, title, url, database, generateHeadings } =
      params
    const { propertiesIds, tagPropertyIndex, tagIndex, tags } = database

    const blocks: any[] = []
    for (let i = 0; i < prompts.length; i++) {
      let decompressedAnswer: string
      let decompressedPrompt: string
      if (compressed) {
        ;[decompressedAnswer, decompressedPrompt] = await Promise.all([
          decompress(answers[i]),
          decompress(prompts[i])
        ])
      } else {
        decompressedAnswer = answers[i]
        decompressedPrompt = prompts[i]
      }

      const { answerBlocks, promptBlocks } = generateBlocks(
        decompressedPrompt,
        decompressedAnswer,
        generateHeadings,
        isMarkdown
      )
      blocks.push(...promptBlocks, ...answerBlocks)
    }

    const canvasBlocks = generateCanvasBlocks(textDocs)
    blocks.push(...canvasBlocks)

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
    console.log("Parsing failed for the following", params)
    console.error(err)
    throw err
  }
}

type ParseSaveParams = {
  prompts: string[]
  answers: string[]
  textDocs: ConversationTextdocs
  title: string
  database: StoredDatabase
  url: string
  generateHeadings: boolean
}
