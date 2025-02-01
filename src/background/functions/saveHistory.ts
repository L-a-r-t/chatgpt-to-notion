import { Storage } from "@plasmohq/storage"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { getConversation } from "~api/getConversation"
import { parseSave } from "~api/parseSave"
import { saveChat } from "~api/saveChat"
import { STORAGE_KEYS } from "~utils/consts"
import { convertHeaders } from "~utils/functions"
import { parseConversation } from "~utils/functions/llms"
import type {
  Conversation,
  HistorySaveError,
  Message,
  StoredDatabase,
  SupportedModels
} from "~utils/types"

const saveHistory = async (
  model: SupportedModels,
  history: string[],
  rawHeaders: { name: string; value?: string }[]
) => {
  const storage = new Storage()

  const databases = await storage.get<StoredDatabase[]>(STORAGE_KEYS.databases)
  const selectedDB = await storage.get<number>(STORAGE_KEYS.selectedDB)
  const generateHeadings = await storage.get<boolean>(
    STORAGE_KEYS.generateHeadings
  )

  await storage.set(STORAGE_KEYS.historySaveProgress, -1)

  const database = databases[selectedDB]

  const headers = convertHeaders(rawHeaders)
  const _convs = await Promise.all(
    history.map((convId) =>
      getConversation({ model: model as any, params: { convId, headers } })
    )
  )
  const convs = _convs
    .filter((conv) => conv !== null)
    .map((conv) =>
      parseConversation({
        model: "chatgpt",
        params: { rawConversation: conv, textDocs: [] }
      })
    )

  await storage.set(STORAGE_KEYS.historyLength, convs.length)
  await storage.set(STORAGE_KEYS.historySaveProgress, 0)
  await storage.set(STORAGE_KEYS.historySaveErrors, [])

  let historySaveProgress = 0
  let historySaveErrors: HistorySaveError[] = []

  for (let i = 0; i < convs.length; i++) {
    try {
      const { conflictingPageId } = await checkSaveConflict({
        title: convs[i].title,
        database
      })

      const parsedConv = await parseSave(
        { ...convs[i], database, generateHeadings },
        { compressed: false, isMarkdown: true }
      )

      await saveChat({
        ...parsedConv,
        model,
        generateHeadings,
        conflictingPageId,
        saveBehavior: "override"
      })

      historySaveProgress++
      await storage.set(STORAGE_KEYS.historySaveProgress, historySaveProgress)

      // avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.error(err)
      historySaveErrors.push({
        title: convs[i].title,
        url: convs[i].url,
        message: err.message ?? err.code ?? err.status ?? "Unknown error"
      })
      await storage.set(STORAGE_KEYS.historySaveErrors, historySaveErrors)
    }
  }
}

export default saveHistory
