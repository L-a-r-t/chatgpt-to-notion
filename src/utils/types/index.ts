import type { IconResponse, SelectPropertyResponse } from "./notion"

export type ToBeSaved = {
  prompt: string
  answer: string
  title: string
  url: string
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
