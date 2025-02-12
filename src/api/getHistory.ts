import { getHistory as chatgptGetHistory } from "~models/chatgpt/api/getHistory"
import type { SupportedModels } from "~utils/types"

export const getHistory = async ({ model, params }: Params) => {
  switch (model) {
    case "chatgpt":
      return chatgptGetHistory(params)
    default:
      throw new Error("Model not supported")
  }
}

type Params = {
  model: "chatgpt"
  params: {
    headers: any
    offset?: number
  }
}
