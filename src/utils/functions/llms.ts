import { parseConversation as chatgptParseConversation } from "~utils/functions/chatgpt"
import type { Conversation, ConversationTextdocs } from "~utils/types"

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
