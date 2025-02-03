import { Storage } from "@plasmohq/storage"

import { getConversation } from "~api/getConversation"
import { getConversationTextdocs } from "~api/getConversationTextdocs"
import { parseSave } from "~api/parseSave"
import { saveChat } from "~api/saveChat"
import { STORAGE_KEYS } from "~utils/consts"
import { convertHeaders } from "~utils/functions"
import { parseConversation } from "~utils/functions/llms"
import type {
  SaveBehavior,
  SaveStatus,
  StoredDatabase,
  SupportedModels
} from "~utils/types"

const save = async (
  convId: string,
  model: SupportedModels,
  {
    rawHeaders,
    turn,
    saveBehavior,
    conflictingPageId,
    autoSave
  }: {
    rawHeaders: { name: string; value?: string }[]
    turn: number
    saveBehavior: SaveBehavior
    conflictingPageId?: string
    autoSave: boolean
  }
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
    const openInNotion = await storage.get<boolean>(STORAGE_KEYS.openInNotion)

    const database = databases[selectedDB ?? 0]

    await storage.set("saveStatus", "fetching" as SaveStatus)

    console.log({ rawHeaders })
    const headers = convertHeaders(
      rawHeaders.filter((h) => h.name.toLowerCase() != "cookie")
    )
    const rawConversation = await getConversation({
      model: model,
      params: { convId, headers }
    })

    console.log({ rawConversation })

    if (!rawConversation) throw new Error("Conversation not found")

    let textDocs: any[] = []
    if (model == "chatgpt") {
      textDocs =
        (await getConversationTextdocs({
          model: model as any,
          params: { rawConversation, headers, includeVersions: true }
        })) ?? []
    }

    const conversation = parseConversation({
      model: model,
      // @ts-ignore
      params: { rawConversation, textDocs }
    })

    console.log({ conversation, turn })

    if (turn >= conversation.prompts.length) {
      turn = conversation.prompts.length - 1
    }
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

    console.log("Chunks to save:", parsedReq.chunks.length)

    await storage.set(
      STORAGE_KEYS.saveStatus,
      `saving:${0}:${parsedReq.chunks.length}` as SaveStatus
    )
    const res = await saveChat(
      {
        ...parsedReq,
        model,
        conflictingPageId: conflictingPageId,
        generateHeadings,
        saveBehavior
      },
      (saved) =>
        storage.set(
          STORAGE_KEYS.saveStatus,
          `saving:${saved}:${parsedReq.chunks.length}` as SaveStatus
        )
    )

    await storage.set(STORAGE_KEYS.saveStatus, "saved" as SaveStatus)
    if (openInNotion && !autoSave) {
      if (res.object == "page") {
        chrome.tabs.create({
          url: `https://www.notion.so/${res.id.replace(/\-/g, "")}`
        })
      } else {
        chrome.tabs.create({
          url: `https://www.notion.so/${conflictingPageId?.replace(/\-/g, "")}`
        })
      }
    }

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
