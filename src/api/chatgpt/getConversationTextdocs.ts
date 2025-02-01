import type {
  CanvasHistoryResponse,
  CanvasMessageMetadata,
  Conversation,
  ConversationTextdocs
} from "~utils/types"

export const getConversationTextdocs = async ({
  conv,
  headers,
  includeVersions
}: {
  conv: Conversation
  headers: any
  includeVersions?: boolean
}) => {
  try {
    const res = await fetch(
      "https://chatgpt.com/backend-api/conversation/" +
        conv.conversation_id +
        "/textdocs",
      {
        method: "GET",
        headers: headers,
        credentials: "include"
      }
    )
    const data: ConversationTextdocs = await res.json()

    if (data.length == 0 || !includeVersions) return data

    const requests = Object.values(conv.mapping).reduce((acc, msg) => {
      if (!msg.message) return acc
      const message = msg.message

      if (!(message?.author?.role == "tool" && "canvas" in message?.metadata))
        return acc
      const canvasMetadata = message.metadata.canvas as CanvasMessageMetadata

      if (
        data.some(
          (textdoc) =>
            textdoc.id == canvasMetadata.textdoc_id &&
            textdoc.version == canvasMetadata.version
        )
      )
        return acc

      const req = fetch(
        "https://chatgpt.com/backend-api/textdoc/" +
          canvasMetadata.textdoc_id +
          "/history?before_version=" +
          canvasMetadata.version +
          1,
        {
          method: "GET",
          headers: headers,
          credentials: "include"
        }
      )

      return [...acc, req]
    }, [] as Promise<Response>[])

    if (requests.length == 0) return data

    const responses = await Promise.all(requests)
    const responsesData: CanvasHistoryResponse[] = await Promise.all(
      responses.filter((r) => r.status < 400).map((r) => r.json())
    )

    return [
      ...data,
      ...responsesData.map((r) => r.previous_doc_states)
    ] as ConversationTextdocs
  } catch (err) {
    console.error(err)

    return null
  }
}
