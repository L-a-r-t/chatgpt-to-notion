import type { Conversation, ConversationTextdocs, Message } from "~utils/types"
import type { CanvasMessageMetadata } from "~utils/types/chatgpt"

export const parseConversation = (
  rawConv: Conversation["chatgpt"],
  textDocs: ConversationTextdocs
) => {
  const { conversation_id: id, title, mapping } = rawConv

  // TODO: fix the bangs (!) that are all over the place
  const messages = Object.values(mapping)
    .filter(
      (item) =>
        item.message != undefined && item.message.author?.role != "system"
    )
    .sort((a, b) => a.message!.create_time - b.message!.create_time)

  const { rawPrompts } = messages.reduce(
    (acc, item, i) => {
      // Triple if statements are smelly but I'm returning acc only at the end which was the point?
      const endIndex = acc.rawPrompts.length - 1
      if (item.message!.author?.role == "user") {
        if (acc.prev == "user") {
          const prevMessage = acc.rawPrompts[endIndex]
          if (prevMessage.message!.content.text) {
            acc.rawPrompts[endIndex].message!.content.text +=
              "\n" + item.message!.content.text
          } else {
            acc.rawPrompts[endIndex].message!.content.parts = [
              ...(prevMessage.message!.content.parts ?? []),
              ...(item.message!.content.parts ?? [item.message!.content.text])
            ]
          }
          acc.rawPrompts[endIndex].children?.push(...(item.children ?? []))
        } else {
          acc.rawPrompts.push(item)
        }
      }
      acc.prev = item.message!.author?.role ?? ""
      return acc
    },
    { prev: "system", rawPrompts: [] } as {
      prev: string
      rawPrompts: Message["chatgpt"][]
    }
  )

  const prompts = rawPrompts.map(
    (item) =>
      item.message!.content.text ??
      (item.message!.content.parts?.join("\n") as string)
  )
  const answers = rawPrompts.map((item) => {
    const answer = []
    flattenMessage(item, mapping, answer, textDocs)
    return answer.join("\n\n")
  })

  const url = "https://chatgpt.com/c/" + id

  return { url, title, prompts, answers, textDocs }
}

export const flattenMessage = (
  msg: Message["chatgpt"],
  mapping: Conversation["chatgpt"]["mapping"],
  flattenedMessage: string[],
  textDocs: ConversationTextdocs
) => {
  const message = msg.message
  if (!message) return

  if (message.author?.role == "tool" && "canvas" in message.metadata) {
    const canvasMetadata = message.metadata.canvas as CanvasMessageMetadata
    const textdoc = textDocs.find(
      (doc) =>
        doc.id == canvasMetadata.textdoc_id &&
        doc.version == canvasMetadata.version
    )
    if (textdoc) {
      flattenedMessage.push(
        `%%CHATGPT_TO_NOTION_WORK2%%\n${"```"}${getTextdocType(
          textdoc.textdoc_type
        )}\n${textdoc.content}\n${"```"}`
      )
    } else {
      flattenedMessage.push("%%CHATGPT_TO_NOTION_CANVAS%%")
    }
  } else if (message.author?.role != "user") {
    switch (message.content.content_type) {
      case "text":
        let text =
          message.content.text ??
          message.content.parts?.join("\n") ??
          "[missing text]"

        if (
          message.recipient == "canmore.create_textdoc" ||
          message.recipient == "canmore.update_textdoc"
        ) {
          break
        }
        flattenedMessage.push(text)
        break

      case "code":
        let code = message.content.text
        code = "%%CHATGPT_TO_NOTION_WORK2%%\n```python\n" + code + "\n```"
        flattenedMessage.push(code)
        break

      case "multimodal_text":
        if (message.author?.name != "dalle.text2im") break
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
  }

  if (msg.children && !(message.end_turn && flattenedMessage.join("") != "")) {
    msg.children.forEach((childId) => {
      const child = mapping[childId]
      if (child.message?.author?.role == "user") return
      flattenMessage(child, mapping, flattenedMessage, textDocs)
    })
  }
}

const getTextdocType = (type: string) => {
  if (type.includes("code")) return type.split("/")[1]
  return type
}
