import { getConversation as chatgptGetConversation } from "~models/chatgpt/api/getConversation"
import type { SupportedModels } from "~utils/types"

import { getConversation as deepseekGetConversation } from "../models/deepseek/api/getConversation"
import { getConversation as mistralGetConversation } from "./mistral/getConversation"

export const getConversation = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversation(params)
    case "deepseek":
      return deepseekGetConversation(params)
    case "mistral":
      return mistralGetConversation(params)
    default:
      throw new Error("Model not supported")
  }
}

type Params = {
  model: SupportedModels
  params: {
    convId: string
    headers: any
  }
}
