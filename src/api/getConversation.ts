import type { SupportedModels } from "~utils/types"

import { getConversation as chatgptGetConversation } from "./chatgpt/getConversation"

export const getConversation = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversation(params)
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
