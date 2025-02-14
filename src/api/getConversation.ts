import { getConversation as chatgptGetConversation } from "~models/chatgpt/api/getConversation"
import { getConversation as claudeGetConversation } from "~models/claude/api/getConversation"
import { getConversation as deepseekGetConversation } from "~models/deepseek/api/getConversation"
import { getConversation as mistralGetConversation } from "~models/mistral/api/getConversation"
import type { SupportedModels } from "~utils/types"

export const getConversation = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetConversation(params)
    case "deepseek":
      return deepseekGetConversation(params)
    case "mistral":
      return mistralGetConversation(params)
    case "claude":
      return claudeGetConversation(params)
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
