import { parseConversation as chatgptParseConversation } from "~utils/functions/chatgpt"
import { parseConversation as deepseekParseConversation } from "~utils/functions/deepseek"
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
    case "deepseek":
      return deepseekParseConversation(params.rawConversation)
    default:
      throw new Error("Model not supported")
  }
}

type ParseConversationParams =
  | {
      model: "chatgpt"
      params: {
        rawConversation: Conversation["chatgpt"]
        textDocs: ConversationTextdocs
      }
    }
  | {
      model: "deepseek"
      params: {
        rawConversation: Conversation["deepseek"]
        textDocs: null
      }
    }

export const getConversationIdFromUrl = (
  model: SupportedModels,
  url: string
) => {
  const urlObj = new URL(url)

  let id: string | undefined

  switch (model) {
    case "chatgpt":
      id = urlObj.pathname.split("/").pop()
      return id?.length != 36 ? null : id
    case "deepseek":
      id = urlObj.pathname.split("/").pop()
      return id?.length != 36 ? null : id
    default:
      throw new Error("Model not supported")
  }
}
