import { Storage } from "@plasmohq/storage"

import { checkSaveConflict } from "~api/checkSaveConflict"
import { getConversation } from "~api/getConversation"
import { parseSave } from "~api/parseSave"
import { saveChat } from "~api/saveChat"
import { convertHeaders } from "~utils/functions"
import type {
  Conversation,
  HistorySaveError,
  Message,
  StoredDatabase
} from "~utils/types"

const saveHistory = async (
  history: string[],
  rawHeaders: { name: string; value?: string }[]
) => {
  const storage = new Storage()

  const databases = await storage.get<StoredDatabase[]>("databases")
  const selectedDB = await storage.get<number>("selectedDB")
  const generateHeadings = await storage.get<boolean>("generateHeadings")

  await storage.set("historySaveProgress", -1)

  const database = databases[selectedDB]

  const headers = convertHeaders(rawHeaders)
  const _convs = await Promise.all(
    history.map((convId) => getConversation(convId, headers))
  )
  const convs = _convs.filter((conv) => conv !== null).map(parseConversation)

  await storage.set("historyLength", convs.length)
  await storage.set("historySaveProgress", 0)
  await storage.set("historySaveErrors", [])

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
        generateHeadings,
        conflictingPageId,
        saveBehavior: "override"
      })

      historySaveProgress++
      await storage.set("historySaveProgress", historySaveProgress)

      // avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      console.error(err)
      historySaveErrors.push({
        title: convs[i].title,
        url: convs[i].url,
        message: err.message ?? err.code ?? err.status ?? "Unknown error"
      })
      await storage.set("historySaveErrors", historySaveErrors)
    }
  }
}

const parseConversation = (rawConv: Conversation) => {
  const { conversation_id: id, title, mapping } = rawConv

  // TODO: fix the bangs (!) that are all over the place
  const messages = Object.values(mapping)
    .filter(
      (item) =>
        item.message != undefined && item.message.author?.role != "system"
    )
    .sort((a, b) => a.message!.create_time - b.message!.create_time)

  const rawPrompts = messages.filter(
    (item) => item.message!.author?.role == "user"
  )

  const prompts = rawPrompts.map(
    (item) =>
      item.message!.content.text ??
      (item.message!.content.parts?.join("\n") as string)
  )
  const answers = rawPrompts.map((item) => {
    const answer = []
    flattenMessage(item, mapping, answer)
    return answer.slice(1).join("\n\n") // Flattening adds the prompt as the first element so we slice
  })

  const url = "https://chat.openai.com/c/" + id

  return { url, title, prompts, answers }
}

const flattenMessage = (
  msg: Message,
  mapping: Conversation["mapping"],
  flattenedMessage: string[]
) => {
  const message = msg.message
  if (!message) return

  switch (message.content.content_type) {
    case "text":
      flattenedMessage.push(
        message.content.text ??
          message.content.parts?.join("\n") ??
          "[missing text]"
      )
      break

    case "code":
      let text = message.content.text
      text = "%%CHATGPT_TO_NOTION_WORK2%%\n```python\n" + text + "\n```"
      flattenedMessage.push(text)
      break

    case "multimodal_text":
      if (message.author?.name != "dalle.text2im") return
      flattenedMessage.push(
        `%%CHATGPT_TO_NOTION_IMAGE${message.content.parts?.length}%%\n`
      )
      message.content.parts?.forEach((part) => {
        if (part.content_type != "image_asset_pointer") return
        const text = `[url: ${part.asset_pointer}], prompt: ${part.metadata.dalle.prompt}\n`
        flattenedMessage.push(text)
      })
      break

    case "execution_output":
      const output =
        message.content.text ??
        message.content.parts?.join("\n") ??
        "[missing text]"
      flattenedMessage.push("```" + output + "```")
      break
  }

  if (msg.children && !message.end_turn) {
    msg.children.forEach((childId) => {
      const child = mapping[childId]
      if (child.message?.author?.role == "user") return
      flattenMessage(child, mapping, flattenedMessage)
    })
  }
}

export default saveHistory
