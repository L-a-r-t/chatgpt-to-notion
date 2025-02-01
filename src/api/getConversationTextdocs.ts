import type { Conversation, SupportedModels } from "~utils/types"

import { getConversationTextdocs as chatgptGetConversationTextdocs } from "./chatgpt/getConversationTextdocs"

export const getConversationTextdocs = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversationTextdocs(params)
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
        conv: Conversation
        headers: any
        includeVersions?: boolean
      }
    }
  | {
      model: "deepseek"
      params: any
    }
