import type { Conversation, SupportedModels } from "~utils/types"

import { getConversationTextdocs as chatgptGetConversationTextdocs } from "./chatgpt/getConversationTextdocs"

export const getConversationTextdocs = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversationTextdocs({
        conv: params.rawConversation,
        headers: params.headers,
        includeVersions: params.includeVersions
      })
    case "deepseek":
      return null
    default:
      throw new Error("Model not supported")
  }
}

type Params =
  | {
      model: "chatgpt"
      params: {
        rawConversation: Conversation["chatgpt"]
        headers: any
        includeVersions?: boolean
      }
    }
  | {
      model: "deepseek"
      params: any
    }
