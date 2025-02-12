import type {
  ChatGPTConversation,
  ChatGPTMessage
} from "../../models/chatgpt/types"
import type {
  DeepseekConversation,
  DeepseekMessage
} from "../../models/deepseek/types"
import type { MistralConversation, MistralMessage } from "./mistral"
import type { IconResponse, SelectPropertyResponse } from "./notion"

export type SupportedModels = "chatgpt" | "deepseek" | "mistral"
// | "gemini"
// | "claude"

export type ToBeSaved = {
  prompt: string
  answer: string
  title: string
  url: string
  pin: number
} | null

export type Error = {
  code?: string | null
  message?: string | null
  status?: number | null
}

export type StoredDatabase = {
  id: string
  title: string
  icon: IconResponse
  propertiesIds: {
    title: string
    url: string
  }
  tags: {
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  }[]
  tagIndex: number
  tagPropertyIndex: number
}

export type PopupEnum =
  | "index"
  | "save"
  | "settings"
  | "about"
  | "wrongpage"
  | "dbsettings"
  | "premium"
  | "ecology"
  | "history"
  | "error"

export type SaveBehavior = "override" | "append" | "ignore"

export type ChatConfig = {
  enabled: boolean
  targetPageId: string | null
  database: StoredDatabase | null
  lastSaveStatus: "success" | "error" | "generating" | null
  lastError: {
    message: string | null
    code: string | null
  } | null
}

export type AutosaveStatus =
  | "generating"
  | "saving"
  | "saved"
  | "error"
  | "disabled"

export type SaveStatus =
  | `saving:${number}:${number}`
  | "saved"
  | "error"
  | "fetching"
  | null

export type Conversation = {
  chatgpt: ChatGPTConversation
  deepseek: DeepseekConversation
  mistral: MistralConversation
}

export type Message = {
  chatgpt: ChatGPTMessage
  deepseek: DeepseekMessage
  mistral: MistralMessage
}

export type ConversationTextdocs = {
  id: string
  version: number
  title: string
  textdoc_type: string
  content: string
  comments: string[]
  updated_at: string
}[]

export type HistorySaveError = {
  url: string
  title: string
  message: string
}

export type ModelHeaders = {
  model: SupportedModels
  headers: { name: string; value?: string }[]
}
