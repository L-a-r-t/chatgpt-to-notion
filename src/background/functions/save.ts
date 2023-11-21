import { Storage } from "@plasmohq/storage"

import { getConversation } from "~api/getConversation"
import { parseSave } from "~api/parseSave"
import { saveChat } from "~api/saveChat"
import { STORAGE_KEYS } from "~utils/consts"
import { convertHeaders, parseConversation } from "~utils/functions"
import type { SaveBehavior, SaveStatus, StoredDatabase } from "~utils/types"

const save = async (
  convId: string,
  rawHeaders: { name: string; value?: string }[],
  turn: number = -1,
  saveBehavior: SaveBehavior = "override",
  conflictingPageId?: string
) => {
  const storage = new Storage()

  try {
    const databases = await storage.get<StoredDatabase[]>(
      STORAGE_KEYS.databases
    )
    const selectedDB = await storage.get<number>(STORAGE_KEYS.selectedDB)
    const generateHeadings = await storage.get<boolean>(
      STORAGE_KEYS.generateHeadings
    )

    const database = databases[selectedDB ?? 0]

    await storage.set("saveStatus", "fetching" as SaveStatus)

    const headers = convertHeaders(rawHeaders)
    const rawConversation = await getConversation(convId, headers)

    console.log({ rawConversation })

    if (!rawConversation?.mapping) throw new Error("Conversation not found")

    const conversation = parseConversation(rawConversation)

    const filteredConversation =
      turn == -1
        ? conversation
        : {
            ...conversation,
            prompts: [conversation.prompts[turn]],
            answers: [conversation.answers[turn]]
          }

    const req = {
      ...filteredConversation,
      database,
      generateHeadings
    }
    const parsedReq = await parseSave(req, {
      compressed: false,
      isMarkdown: true
    })

    await storage.set(STORAGE_KEYS.saveStatus, "saving" as SaveStatus)
    const res = await saveChat({
      ...parsedReq,
      conflictingPageId: conflictingPageId,
      generateHeadings,
      saveBehavior
    })

    await storage.set(STORAGE_KEYS.saveStatus, "saved" as SaveStatus)
    return res
  } catch (err) {
    console.error(err)
    await storage.set(STORAGE_KEYS.saveStatus, "error" as SaveStatus)
    await storage.set(STORAGE_KEYS.error, {
      ...err,
      message: err.message ?? JSON.parse(err.body ?? "{}").message
    })
    throw err
  }
}

export default save
