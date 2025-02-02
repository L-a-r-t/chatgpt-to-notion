import type { SupportedModels } from "~utils/types"

import { getConversation as chatgptGetConversation } from "./chatgpt/getConversation"
import { getConversation as deepseekGetConversation } from "./deepseek/getConversation"

export const getConversation = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversation(params)
    case "deepseek":
      return deepseekGetConversation(params)
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
