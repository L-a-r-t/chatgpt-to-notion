import { parseConversation as chatgptParseConversation } from "~utils/functions/chatgpt"
import type {
  Conversation,
  ConversationTextdocs,
  SupportedModels
} from "~utils/types"

export const parseConversation = ({
  model,
  params
}: ParseConversationParams) => {
  switch (model) {
    case "chatgpt":
      return chatgptParseConversation(params.rawConversation, params.textDocs)
    default:
      throw new Error("Model not supported")
  }
}

type ParseConversationParams = {
  model: "chatgpt"
  params: {
    rawConversation: Conversation
    textDocs: ConversationTextdocs
  }
}

export const getConversationIdFromUrl = (
  model: SupportedModels,
  url: string
) => {
  const urlObj = new URL(url)

  switch (model) {
    case "chatgpt":
      return urlObj.pathname.split("/").pop()
    case "deepseek":
      return urlObj.pathname.split("/").pop()
    default:
      throw new Error("Model not supported")
  }
}
