import { getHistory as chatgptGetHistory } from "~models/chatgpt/api/getHistory"
import { getHistory as claudeGetHistory } from "~models/claude/api/getHistory"
import { getHistory as deepseekGetHistory } from "~models/deepseek/api/getHistory"
import type { SupportedModels } from "~utils/types"

export const getHistory = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetHistory(params)
    case "deepseek":
      return deepseekGetHistory(params)
    case "claude":
      return claudeGetHistory(params)
    default:
      throw new Error("Model not supported")
  }
}

type Params = {
  model: SupportedModels
  params: {
    headers: any
    offset?: number
  }
}
